const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), '.keshuGit');
  const stagedPath = path.join(repoPath, 'staging');
  const commitsPath = path.join(repoPath, 'commits');

  try {
    // 1. Generate a unique commit ID
    const commitID = uuidv4();
    const commitDir = path.join(commitsPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    // 2. Recursively copy staging files/folders into the commit directory
    const copyRecursive = async (src, dest) => {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          await copyRecursive(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    };

    await copyRecursive(stagedPath, commitDir);

    // 3. Write commit metadata to config.json
    const metadata = {
      message,
      date: new Date().toISOString(),
      author: process.env.USER || 'anonymous'
    };

    await fs.writeFile(
      path.join(commitDir, 'config.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    // 4. (Optional) Clear staging area after commit
    await fs.rm(stagedPath, { recursive: true, force: true });
    await fs.mkdir(stagedPath, { recursive: true });

    console.log(`✅ Commit ${commitID} created with message: "${message}"`);
    return commitID;

  } catch (err) {
    console.error("❌ Error committing files:", err.message);
  }
}

module.exports = { commitRepo };
