const express = require('express');
const userRouter = require('./user.router.js');
const repoRouter = require('./repo.router.js');
const issueRouter = require('./issue.router.js')
const mainRouter = express.Router();
const router = require('./commit.daily.commits.js')


mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
mainRouter.use(router);

mainRouter.get('/', (req, res) => {
    res.send("Welcome");
});


module.exports = mainRouter;