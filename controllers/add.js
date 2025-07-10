const fs = require('fs').promises;
const path = require('path');

async function addRepo(filePath) {
  const repoPath = path.resolve(process.cwd(), ".keshuGit");
  const stagingPath = path.join(repoPath, 'staging');

  try {
    await fs.access(filePath); // Check if file exists
    const relativePath = path.relative(process.cwd(), filePath);
    const destPath = path.join(stagingPath, relativePath);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(filePath, destPath);
    console.log(`File "${relativePath}" added to the staging area!`);
  } catch (err) {
    console.error("Error adding file:", err.message);
  }
}

module.exports = { addRepo };
