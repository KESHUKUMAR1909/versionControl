const express = require('express');
const repoRouter = express.Router();
const repoController = require('../controllers/repoController.js');

repoRouter.post('/repo/create', repoController.createRepository);
repoRouter.get('/repo/all', repoController.getAllRepositories);
repoRouter.get('/repo/:id', repoController.fetchRepositoryById);
repoRouter.get('/repo/name/:name', repoController.fetchRepositoryByName);
repoRouter.get('/repo/user/:userID', repoController.fetchRepositoriesForCurrentUser);
repoRouter.put('/repo/update/:id', repoController.updateRepositoryById);
repoRouter.delete('/repo/delete/:id', repoController.deleteRepositoryById);
repoRouter.patch('/repo/toggle/:id', repoController.toggleVisibilityById);

// 🧠 Correct usage — only 1 route handler for file/folder fetch
repoRouter.get(
    '/repo/:repoId/commit/:commitId/file/',
    (req, res, next) => {
        req.params[0] = ''; // inject empty wildcard param
        next();
    },
    repoController.getFileOrFolderFromCommit
);


// ✅ Route for commit history
repoRouter.get('/repo/:id/commits', repoController.getCommitsByRepo);

repoRouter.get(
  '/repo/:repoId/commit/:commitId/details/:path',
  repoController.getFileDetailsFromCommit
);

module.exports = repoRouter;
