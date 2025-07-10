const AWS = require('aws-sdk');
const { S3_BUCKET } = require('../config/aws-config');

const s3 = new AWS.S3();

exports.getCommitFiles = async (req, res) => {
  const { repoId, commitId } = req.params;

  try {
    const s3Params = {
      Bucket: S3_BUCKET,
      Prefix: `commits/${repoId}/${commitId}/`,
    };

    const data = await s3.listObjectsV2(s3Params).promise();

    const files = data.Contents
      .map(obj => obj.Key)
      .filter(key => !key.endsWith('config.json'))
      .map(key => key.replace(`commits/${repoId}/${commitId}/`, '')); // Keep folder structure

    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files', details: err.message });
  }
};
