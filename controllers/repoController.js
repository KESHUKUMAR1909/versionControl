const mongoose = require("mongoose");
const Repository = require('../models/repoModel.js');
const User = require('../models/userModel.js');
const Issue = require('../models/issueModel.js');

// CREATE a new repository
const createRepository = async (req, res) => {
    const { owner, name, issues, content, description, visibility } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ error: "Repository name is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const newRepository = new Repository({
            name, description, visibility, owner, content, issues
        });

        const result = await newRepository.save();

        res.status(201).json({
            message: "Repository created successfully!",
            repositoryID: result._id
        });
    } catch (err) {
        console.error("Error creating repository:", err);
        res.status(500).json({ error: "Internal Server Error while creating repository" });
    }
};

// GET all repositories
const getAllRepositories = async (req, res) => {
    try {
        const repositories = await Repository.find({}).populate("owner").populate('issues');
        res.status(200).json({ repositories });
    } catch (err) {
        console.error("Error fetching all repositories:", err);
        res.status(500).json({ error: "Internal Server Error while fetching repositories" });
    }
};

// GET repository by ID
const fetchRepositoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const repository = await Repository.findById(id).populate("owner").populate("issues");

        if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        res.status(200).json({ repository });
    } catch (err) {
        console.error("Error fetching repository by ID:", err);
        res.status(500).json({ error: "Internal Server Error while fetching repository" });
    }
};

// GET repository by name
const fetchRepositoryByName = async (req, res) => {
    const { name } = req.params;
    try {
        const repository = await Repository.find({ name }).populate("owner").populate("issues");

        res.status(200).json({ repository });
    } catch (err) {
        console.error("Error fetching repository by name:", err);
        res.status(500).json({ error: "Internal Server Error while fetching repository" });
    }
};

// GET repositories of logged-in user
const fetchRepositoriesForCurrentUser = async (req, res) => {
    const userId = req.user;

    try {
        const repositories = await Repository.find({ owner: userId });

        if (!repositories || repositories.length === 0) {
            return res.status(404).json({ error: "No repositories found for this user" });
        }

        res.json({
            message: "Repositories retrieved successfully",
            repositories
        });
    } catch (err) {
        console.error("Error fetching user's repositories:", err);
        res.status(500).json({ error: "Internal Server Error while fetching user's repositories" });
    }
};

// UPDATE a repository
const updateRepositoryById = async (req, res) => {
    const { id } = req.params;
    const { content, description } = req.body;

    try {
        const updatedRepository = await Repository.findByIdAndUpdate(
            id,
            { $set: { content, description } },
            { new: true }
        );

        if (!updatedRepository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        res.json({
            message: "Repository updated successfully",
            repository: updatedRepository
        });
    } catch (err) {
        console.error("Error updating repository:", err);
        res.status(500).json({ error: "Internal Server Error while updating repository" });
    }
};

// DELETE a repository
const deleteRepositoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRepository = await Repository.findByIdAndDelete(id);

        if (!deletedRepository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        res.json({ message: "Repository deleted successfully" });
    } catch (err) {
        console.error("Error deleting repository:", err);
        res.status(500).json({ error: "Internal Server Error while deleting repository" });
    }
};

// TOGGLE visibility (public/private)
const toggleVisibilityById = async (req, res) => {
    const { id } = req.params;

    try {
        const repo = await Repository.findById(id);

        if (!repo) {
            return res.status(404).json({ message: "Repository not found" });
        }

        const updatedRepository = await Repository.findByIdAndUpdate(
            id,
            { $set: { visibility: !repo.visibility } },
            { new: true }
        );

        res.json({
            message: "Repository visibility toggled successfully",
            repository: updatedRepository
        });
    } catch (err) {
        console.error("Error toggling repository visibility:", err);
        res.status(500).json({ error: "Internal Server Error while toggling visibility" });
    }
};

module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoriesForCurrentUser,
    updateRepositoryById,
    deleteRepositoryById,
    toggleVisibilityById
};
