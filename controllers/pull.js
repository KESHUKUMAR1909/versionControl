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
            const key = object.Key; 

            const commitFolderName = path.dirname(key).split('/').pop();
            const commitDir = path.join(commitsPath, commitFolderName);
            await fs.mkdir(commitDir, { recursive: true });

            const params = {
                Bucket: S3_BUCKET,
                Key: key,
            }

            const fileContent = await s3.getObject(params).promise();
            await fs.writeFile(path.join(repoPath, key), fileContent.Body);
        }

        console.log("✅ All commits pulled from S3.");
        
    } catch (err) {
        console.error("❌ Unable to pull:", err);
    }
}

module.exports = { pullRepo };
