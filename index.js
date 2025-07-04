const yargs = require('yargs');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { hideBin } = require('yargs/helpers');
const http = require('http');
const { Server } = require('socket.io')

// Controllers
const { initRepo } = require('./controllers/init.js');
const { addRepo } = require('./controllers/add.js');
const { commitRepo } = require('./controllers/commit.js');
const { pushRepo } = require('./controllers/push.js');
const { pullRepo } = require('./controllers/pull.js');
const { revertRepo } = require('./controllers/revert.js');


// Router
const mainRouter = require('./routes/main.router.js');
// Yargs Commands
yargs(hideBin(process.argv))
    .command(
        'start',
        'Starts a new server',
        {},
        startServer
    )
    .command(
        'init',
        'Initialise a new repository',
        () => { },
        initRepo
    )
    .command(
        'add <file>',
        'Add a file to the repository',
        (yargs) => {
            return yargs.positional('file', {
                describe: 'File to add to the staging area',
                type: 'string',
            });
        },
        (argv) => {
            addRepo(argv.file);
        }
    )
    .command(
        'commit <message>',
        'Commit the staged files',
        (yargs) => {
            return yargs.positional('message', {
                describe: 'Commit message',
                type: 'string',
            });
        },
        (argv) => {
            commitRepo(argv.message);
        }
    )
    .command(
        'push',
        'Push commits to S3',
        {},
        pushRepo
    )
    .command(
        'pull',
        'Pull commits from S3',
        {},
        pullRepo
    )
    .command(
        'revert <commitID>',
        'Revert to a specific commit',
        (yargs) => {
            return yargs.positional('commitID', {
                describe: "Commit ID to revert to",
                type: "string"
            });
        },
        (argv) => {
            revertRepo(argv.commitID);
        }
    )
    .demandCommand(1, 'You need at least one command')
    .strict()
    .help()
    .epilog('GitClone CLI by Keshu Kumar')
    .argv;

// Start Server Function
async function startServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.json());

    const mongoURI = process.env.MONGO_URI;
    console.log("Connecting to MongoDB...");
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to db")
    } catch (err) {
        console.log(err);
    }

    // to give live updtes to the user about the repo we use socket
    app.use(cors({
        origin: "*"
    }));

    app.use("/",mainRouter);

    let user = 'test';

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });
    io.on('connection', (socket) => {
        socket.on('joinRoom', (userID) => {
            user = userID,
                console.log("====="),
                console.log(user);
            console.log("=====");
        });

    });
    const db = mongoose.connection;
    db.once('open', async () => {
        console.log("CRUD operations called");

    });

    httpServer.listen(port, () => {
        console.log(`Server is running on PORT ${port}`);
    })


}
