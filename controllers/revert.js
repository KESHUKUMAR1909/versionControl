const fs = require('fs').promises;
const path = require('path');

async function revertRepo(commitID) {
  const repoPath = path.resolve(process.cwd(), '.keshuGit');
  const commitsPath = path.join(repoPath, 'commits');
  const commitDir = path.join(commitsPath, commitID);
  const projectRoot = path.resolve(repoPath, '..');

  try {
    // Check if commit folder exists
    const stat = await fs.stat(commitDir);
    if (!stat.isDirectory()) {
      return console.error(`❌ Commit ${commitID} directory not found.`);
    }

    const files = await fs.readdir(commitDir);

    for (const file of files) {
      if (file === 'config.json') continue; // skip metadata
      const src = path.join(commitDir, file);
      const dest = path.join(projectRoot, file);
      await fs.copyFile(src, dest);
    }

    console.log(`✅ Commit ${commitID} reverted successfully.`);
  } catch (err) {
    console.error("❌ Unable to revert:", err.message);
  }
}

module.exports = { revertRepo };
