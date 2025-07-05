const express = require('express');
const repoRouter = express.Router();

// controller
const repoContoller = require('../controllers/repoController.js');


repoRouter.post('/repo/create', repoContoller.createRepository);
repoRouter.get('/repo/all', repoContoller.getAllRepositories);
repoRouter.get('/repo/:id', repoContoller.fetchRepositoryById);
repoRouter.get('/repo/name/:name', repoContoller.fetchRepositoryByName);
repoRouter.get('/repo/user/:userID', repoContoller.fetchRepositoriesForCurrentUser);
repoRouter.put('/repo/update/:id', repoContoller.updateRepositoryById);
repoRouter.delete('/repo/delete/:id', repoContoller.deleteRepositoryById);
repoRouter.patch('/repo/toggle/:id', repoContoller.toggleVisibilityById);


module.exports = repoRouter;