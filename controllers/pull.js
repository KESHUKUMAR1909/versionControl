const { s3, S3_BUCKET } = require('../config/aws-config.js');
const fs = require('fs').promises;
const path = require('path');

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), '.keshuGit');
  const commitsPath = path.join(repoPath, 'commits');

  try {
    const data = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix: 'commits/'
    }).promise();

    const objects = data.Contents;

    for (const object of objects) {
      const key = object.Key; // e.g. "commits/repo123/commit456/src/index.js"
      if (key.endsWith('/')) continue; // skip folders

      const relativeKey = key.replace('commits/', ''); // remove prefix
      const localFilePath = path.join(commitsPath, relativeKey); // proper local path
      const localDir = path.dirname(localFilePath);

      await fs.mkdir(localDir, { recursive: true });

      const fileContent = await s3.getObject({
        Bucket: S3_BUCKET,
        Key: key
      }).promise();

      await fs.writeFile(localFilePath, fileContent.Body);
    }

    console.log("✅ All commits pulled from S3.");

  } catch (err) {
    console.error("❌ Unable to pull:", err.message);
  }
}

module.exports = { pullRepo };
