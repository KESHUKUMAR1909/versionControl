const fs = require('fs').promises;
const path = require('path');

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".keshuGit");
  const commitsPath = path.join(repoPath, "commits");
  const stagingPath = path.join(repoPath, "staging");

  try {
    // 1. Create required folders
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.mkdir(stagingPath, { recursive: true });

    // 2. Save config with S3 bucket name
    const bucketName = process.env.S3_BUCKET || null;
    if (!bucketName) {
      console.warn("⚠️ Warning: S3_BUCKET not set in environment variables.");
    }

    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: bucketName }, null, 2)
    );

    // 3. Success log
    console.log("✅ Repository initialized locally in .keshuGit");
    console.log("👉 Now run:");
    console.log("   node index.js connect <repoId>");
    console.log("   (Replace <repoId> with the one from your frontend-created repo)");

  } catch (err) {
    console.error("❌ Error initializing repository:", err.message);
  }
}

module.exports = { initRepo };
