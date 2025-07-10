const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const { s3, S3_BUCKET } = require('../config/aws-config');
const Commit = require('../models/Commit');
const Repository = require('../models/Repository');

// Recursive function to walk through a folder
async function walkDir(dir, root = dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath).replace(/\\/g, '/'); // for Windows compatibility

    if (entry.isDirectory()) {
      const nestedFiles = await walkDir(fullPath, root);
      results = results.concat(nestedFiles);
    } else {
      results.push({ fullPath, relativePath });
    }
  }
  return results;
}

// Check if file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function pushRepo() {
  const repoDir = path.resolve(process.cwd(), '.keshuGit');
  const repoInfoPath = path.join(repoDir, 'repo.json');
  const commitsDir = path.join(repoDir, 'commits');

  try {
    // Step 0: MongoDB connection
    if (!mongoose.connection.readyState) {
      console.log("🔌 Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected");
    }

    // Step 1: Read repo ID
    const repoInfoRaw = await fs.readFile(repoInfoPath, 'utf-8');
    const { repoId } = JSON.parse(repoInfoRaw);
    if (!repoId) return console.error("❌ repoId missing in repo.json");

    // Step 2: Get all commit folders
    const commitDirs = await fs.readdir(commitsDir);

    // Step 3: Get already pushed commit IDs
    const existingCommits = await Commit.find({ repo: repoId }).select('commitId');
    const uploadedCommitIds = new Set(existingCommits.map(c => c.commitId));

    for (const commitId of commitDirs) {
      if (uploadedCommitIds.has(commitId)) {
        console.log(`⏩ Skipping already pushed commit ${commitId}`);
        continue;
      }

      const commitPath = path.join(commitsDir, commitId);

      // Skip if config.json is missing
      const configPath = path.join(commitPath, 'config.json');
      if (!(await fileExists(configPath))) {
        console.warn(`⚠️ Skipping commit ${commitId}: config.json missing`);
        continue;
      }

      const configRaw = await fs.readFile(configPath, 'utf-8');
      const { message, date } = JSON.parse(configRaw);

      // Upload all files recursively
      const allFiles = await walkDir(commitPath);
      const fileKeys = [];

      for (const fileObj of allFiles) {
        const { fullPath, relativePath } = fileObj;
        if (relativePath === 'config.json') continue;

        const s3Key = `commits/${repoId}/${commitId}/${relativePath}`;
        const content = await fs.readFile(fullPath);

        try {
          await s3.upload({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: content,
          }).promise();

          fileKeys.push(relativePath);
        } catch (uploadErr) {
          console.error(`❌ Failed to upload ${relativePath}:`, uploadErr.message);
        }
      }

      console.log(`✅ Pushed commit ${commitId} to S3`);

      // Step 4: Update repository's content field (optional)
      await Repository.findByIdAndUpdate(repoId, {
        $addToSet: { content: { $each: fileKeys } },
      });

      // Step 5: Save commit metadata to DB
      await Commit.create({
        repo: repoId,
        commitId,
        message,
        date,
      });
    }

    console.log("🎉 All commits pushed successfully!");
  } catch (err) {
    console.error("❌ Error pushing commits:", err.message);
  }
}

module.exports = { pushRepo };
