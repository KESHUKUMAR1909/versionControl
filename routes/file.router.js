const express = require('express');
const router = express.Router();
const { s3, S3_BUCKET } = require('../config/aws-config');

// ✅ Get contents of a folder in a commit
router.get('/:repoId/:commitId/folder', async (req, res) => {
  const { repoId, commitId } = req.params;
  const folderPath = req.query.path || '';

  const normalized = folderPath.replace(/^\/+|\/+$/g, ''); // Trim leading/trailing slashes
  const prefix = `commits/${repoId}/${commitId}/${normalized ? normalized + '/' : ''}`;

  try {
    const result = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix: prefix,
      Delimiter: '/'
    }).promise();

    // List files
    const files = result.Contents
      .filter(obj => obj.Key !== prefix) // Exclude the folder itself
      .map(obj => ({
        name: decodeURIComponent(obj.Key.split('/').pop()),
        type: 'file'
      }));

    // List folders
    const folders = (result.CommonPrefixes || []).map(prefixObj => ({
      name: decodeURIComponent(prefixObj.Prefix.split('/').slice(-2, -1)[0]),
      type: 'folder'
    }));

    res.status(200).json({ contents: [...folders, ...files] });
  } catch (err) {
    console.error("❌ S3 Folder Fetch Error:", err.message);
    res.status(500).json({ error: 'Error fetching folder content', details: err.message });
  }
});

// ✅ Get a single file's content from a commit
router.get('/:repoId/:commitId/file', async (req, res) => {
  const { repoId, commitId } = req.params;
  const filePath = req.query.path;

  if (!filePath) {
    return res.status(400).json({ error: 'Missing file path' });
  }

  const key = `commits/${repoId}/${commitId}/${filePath.replace(/^\/+/, '')}`;

  try {
    const s3Object = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: key
    }).promise();

    const content = s3Object.Body.toString('utf-8');
    res.status(200).json({ content });
  } catch (err) {
    console.error("❌ S3 File Fetch Error:", err.message);
    res.status(500).json({ error: 'Error fetching file', details: err.message });
  }
});

module.exports = router;
