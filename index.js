#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require('http');
const { Server } = require('socket.io');

// ✅ Move this function above yargs command registration
async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ MONGO_URI not defined in environment variables');
    process.exit(1);
  }

  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  app.use(bodyParser.json());
  app.use(express.json());

  // 🔗 API Routes
  const mainRouter = require('./routes/main.router.js');
  app.use("/", mainRouter);

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', socket => {
    console.log("🔌 Socket connected");
    socket.on('joinRoom', userID => {
      console.log("👤 User joined room:", userID);
      socket.join(userID);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

// CLI Controllers
const { initRepo } = require('./controllers/init.js');
const { addRepo } = require('./controllers/add.js');
const { commitRepo } = require('./controllers/commit.js');
const { pushRepo } = require('./controllers/push.js');
const { pullRepo } = require('./controllers/pull.js');
const { revertRepo } = require('./controllers/revert.js');

// Register CLI commands with yargs
yargs(hideBin(process.argv))
  .command('start', 'Start the backend server', {}, startServer)
  .command('init', 'Initialize a new repository', {}, initRepo)
  .command('add <file>', 'Add file to staging area', yargs => {
    return yargs.positional('file', {
      describe: 'File to add',
      type: 'string',
    });
  }, argv => addRepo(argv.file))
  .command('commit <message>', 'Commit staged files', yargs => {
    return yargs.positional('message', {
      describe: 'Commit message',
      type: 'string',
    });
  }, argv => commitRepo(argv.message))
  .command('push', 'Push commits to S3 and MongoDB', {}, pushRepo)
  .command('pull', 'Pull commits from remote', {}, pullRepo)
  .command('revert <commitID>', 'Revert to a specific commit', yargs => {
    return yargs.positional('commitID', {
      describe: "Commit ID to revert to",
      type: "string"
    });
  }, argv => revertRepo(argv.commitID))
  .command('connect <repoId>', 'Link current folder to existing repo from frontend', yargs => {
    return yargs.positional('repoId', {
      describe: 'Repo ID from the backend',
      type: 'string'
    });
  }, async argv => {
    const fs = require('fs').promises;
    const path = require('path');
    const repoPath = path.resolve(process.cwd(), '.keshuGit');

    if (!/^[a-f\d]{24}$/i.test(argv.repoId)) {
      console.error("❌ Invalid repo ID. Must be 24-character MongoDB ObjectId.");
      process.exit(1);
    }

    try {
      // Already connected check
      try {
        await fs.access(path.join(repoPath, 'repo.json'));
        console.error("⚠️ Repo already connected. Remove .keshuGit first.");
        process.exit(1);
      } catch (_) {}

      await fs.mkdir(repoPath, { recursive: true });
      await fs.mkdir(path.join(repoPath, 'commits'), { recursive: true });
      await fs.mkdir(path.join(repoPath, 'staging'), { recursive: true });

      await fs.writeFile(
        path.join(repoPath, 'repo.json'),
        JSON.stringify({ repoId: argv.repoId }, null, 2)
      );

      await fs.writeFile(
        path.join(repoPath, 'config.json'),
        JSON.stringify({ bucket: process.env.S3_BUCKET || 'default-bucket' }, null, 2)
      );

      console.log(`✅ Connected this folder to repo ID: ${argv.repoId}`);
    } catch (err) {
      console.error("❌ Failed to connect:", err.message);
    }
  })
  .demandCommand(1, '❌ Please provide a valid command')
  .strict()
  .help()
  .epilog('⚡ KeshuGit CLI by Keshu Kumar')
  .argv;
