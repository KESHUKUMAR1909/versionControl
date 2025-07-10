const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const path = require("path");
const Repository = require("../models/Repository.js");
const User = require("../models/userModel.js");
const Issue = require("../models/issueModel.js");
const Commit = require("../models/Commit.js");
const { S3_BUCKET } = require("../config/aws-config");

const s3 = new AWS.S3();

// ✅ GET file or folder content from S3 for a specific commit
const getFileOrFolderFromCommit = async (req, res) => {
  console.log("Entered here");
  const { repoId, commitId } = req.params;
  const rawPath = req.params[0] || ""; // Wildcard after /file/*
  const cleanPath = rawPath.replace(/^\/+/g, "");
  const fileKey = `commits/${repoId}/${commitId}/${cleanPath}`;
  console.log(fileKey);
  const folderPrefix = fileKey.endsWith("/") ? fileKey : `${fileKey}/`;

  try {
    // First try to fetch it as a file
    try {
      const fileObj = await s3.getObject({ Bucket: S3_BUCKET, Key: fileKey }).promise();
      const content = fileObj.Body.toString("utf-8");
      return res.status(200).json({ type: "file", path: rawPath, content });
    } catch (fileErr) {
      if (fileErr.code !== "NoSuchKey") throw fileErr;
    }

    // If not a file, try as folder
    const folderObjects = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix: folderPrefix
    }).promise();

    if (!folderObjects.Contents || folderObjects.Contents.length === 0) {
      return res.status(404).json({ error: "File or folder not found." });
    }

    const filesSet = new Set();
    folderObjects.Contents.forEach(obj => {
      const relative = obj.Key.replace(folderPrefix, "");
      if (!relative) return;
      const firstPart = relative.split("/")[0];
      filesSet.add(firstPart);
    });

    const files = Array.from(filesSet).map(name => ({
      name,
      path: `${cleanPath}/${name}`.replace(/^\/+/, ''),
      type: name.includes(".") ? "file" : "folder"
    }));

    return res.status(200).json({ type: "folder", path: rawPath, files });
  } catch (err) {
    console.error("❌ S3 Error:", err.message);
    return res.status(500).json({ error: "Error fetching file/folder", details: err.message });
  }
};


// ✅ CREATE Repository
const createRepository = async (req, res) => {
  const { owner, name, issues, content, description, visibility } = req.body;
  try {
    if (!name) return res.status(400).json({ error: "Repository name is required" });
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const newRepository = new Repository({ name, description, visibility, owner, content, issues });
    const result = await newRepository.save();
    res.status(201).json({ message: "Repository created successfully!", repositoryID: result._id });
  } catch (err) {
    console.error("Error creating repository:", err);
    res.status(500).json({ error: "Internal Server Error while creating repository" });
  }
};

// ✅ GET All Repositories (with optional visibility filter)
const getAllRepositories = async (req, res) => {
  const onlyPublic = req.query.public === "true";
  try {
    const query = onlyPublic ? { visibility: true } : {};
    const repositories = await Repository.find(query).populate("owner").populate("issues");
    res.status(200).json({ repositories });
  } catch (err) {
    console.error("Error fetching repositories:", err);
    res.status(500).json({ error: "Internal Server Error while fetching repositories" });
  }
};

// ✅ GET Repository by ID
const fetchRepositoryById = async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.id).populate("owner").populate("issues");
    // console.log(repository);
    if (!repository) return res.status(404).json({ error: "Repository not found" });
    res.status(200).json({ repository });
  } catch (err) {
    console.error("Error fetching repository:", err);
    res.status(500).json({ error: "Internal Server Error while fetching repository" });
  }
};

// ✅ GET Repositories for a User
const fetchRepositoriesForCurrentUser = async (req, res) => {
  const userId = req.params.userID;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  try {
    const repositories = await Repository.find({ owner: userId });
    res.status(200).json({ message: "Repositories retrieved successfully", repositories });
  } catch (err) {
    console.error("Error fetching user's repositories:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ UPDATE Repository
const updateRepositoryById = async (req, res) => {
  const { content, description } = req.body;
  try {
    const updated = await Repository.findByIdAndUpdate(
      req.params.id,
      { $set: { content, description } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Repository not found" });
    res.json({ message: "Repository updated successfully", repository: updated });
  } catch (err) {
    console.error("Error updating repository:", err);
    res.status(500).json({ error: "Internal Server Error while updating repository" });
  }
};

// ✅ DELETE Repository + all related data
const deleteRepositoryById = async (req, res) => {
  try {
    const deleted = await Repository.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Repository not found" });

    // Clean up related data
    await Commit.deleteMany({ repo: req.params.id });
    await Issue.deleteMany({ repository: req.params.id });

    // Optional: delete S3 folder
    const s3List = await s3
      .listObjectsV2({ Bucket: S3_BUCKET, Prefix: `commits/${req.params.id}/` })
      .promise();

    if (s3List.Contents.length > 0) {
      const deleteParams = {
        Bucket: S3_BUCKET,
        Delete: {
          Objects: s3List.Contents.map(obj => ({ Key: obj.Key })),
        },
      };
      await s3.deleteObjects(deleteParams).promise();
    }

    res.json({ message: "Repository and related data deleted successfully" });
  } catch (err) {
    console.error("Error deleting repository:", err);
    res.status(500).json({ error: "Internal Server Error while deleting repository" });
  }
};

// ✅ TOGGLE Visibility
const toggleVisibilityById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const updated = await Repository.findByIdAndUpdate(
      req.params.id,
      { $set: { visibility: !repo.visibility } },
      { new: true }
    );

    res.json({ message: "Repository visibility toggled successfully", repository: updated });
  } catch (err) {
    console.error("Error toggling repository visibility:", err);
    res.status(500).json({ error: "Internal Server Error while toggling visibility" });
  }
};

// ✅ GET all Commits for a Repository
const getCommitsByRepo = async (req, res) => {
  const { id: repoId } = req.params;

  // 🔐 Validate repoId
  if (!mongoose.Types.ObjectId.isValid(repoId)) {
    return res.status(400).json({ error: "Invalid repository ID" });
  }

  try {
    // 📥 Fetch commits by repo, latest first
    const commits = await Commit.find({ repo: repoId }).sort({ date: -1 });

    if (!commits || commits.length === 0) {
      return res.status(404).json({ message: "No commits found for this repository." });
    }

    res.status(200).json({ commits });
  } catch (err) {
    console.error("❌ Error fetching commits:", err);
    res.status(500).json({ error: "Internal server error while fetching commits" });
  }
};
// ✅ Get repository by name (used in /repo/name/:name)
const fetchRepositoryByName = async (req, res) => {
  const { name } = req.params;
  try {
    const repo = await Repository.findOne({ name }).populate("owner").populate("issues");
    if (!repo) return res.status(404).json({ error: "Repository not found" });
    res.status(200).json({ repository: repo });
  } catch (err) {
    console.error("Error fetching repository by name:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getFileDetailsFromCommit = async (req, res) => {
  const { repoId, commitId } = req.params;
  const rawPath = req.params.path || '';
  const cleanPath = rawPath.replace(/^\/+/, '');
  const fileKey = `commits/${repoId}/${commitId}/${cleanPath}`;

  try {
    const head = await s3.headObject({
      Bucket: S3_BUCKET,
      Key: fileKey
    }).promise();

    const fileObj = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: fileKey
    }).promise();

    const content = fileObj.Body.toString('utf-8');

    return res.status(200).json({
      type: 'file',
      name: cleanPath.split('/').pop(),
      path: cleanPath,
      size: head.ContentLength,
      lastModified: head.LastModified,
      contentType: head.ContentType,
      content
    });
  } catch (err) {
    console.error("❌ Error fetching file details:", err.message);
    return res.status(500).json({ error: "Failed to fetch file details", details: err.message });
  }
};



module.exports = {
  createRepository,
  fetchRepositoryByName,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  deleteRepositoryById,
  toggleVisibilityById,
  getCommitsByRepo,
  getFileOrFolderFromCommit,
  getFileDetailsFromCommit
};
