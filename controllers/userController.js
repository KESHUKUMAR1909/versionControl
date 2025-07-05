const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { MongoClient, ReturnDocument } = require('mongodb');

require('dotenv').config();
const uri = process.env.MONGO_URI;

let client;
var ObjectId = require('mongodb').ObjectId;

async function connectClient() {
    if (!client) {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    await client.connect();

}

const getAllUsers = async (req, res) => {
    try {
        await connectClient();
        const db = client.db('githubClone');
        const usersCollection = db.collection('users');

        const users = await usersCollection.find({}).toArray();

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error!");
    }
};

const signup = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        await connectClient();
        const db = client.db('githubClone');
        const usersCollection = db.collection('users');


        const user = await usersCollection.findOne({ username });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUsers: [],
            starRepos: []
        }

        const result = await usersCollection.insertOne(newUser);

        const token = jwt.sign({
            id: result.insertedId
        },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json(token);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error!")
    }

}
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db('githubClone');
        const usersCollection = db.collection('users');


        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        res.json({ token, userId: user._id });


    } catch (err) {
        console.log("Error during login", err.message);
        console.log("Server error");
    }
}

const getUserProfile = async (req, res) => {
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db('githubClone');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({
            _id: new ObjectId(currentID)
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error!");
    }
}


const updateUserProfile = async (req, res) => {
    const currentID = req.params.id;
    const { email, password } = req.body;
    try {

        let updateFields = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }


        await connectClient();
        const db = client.db('githubClone');
        const usersCollection = db.collection('users');

        const result = await usersCollection.findOneAndUpdate({
            _id: new ObjectId(currentID)
        }, { $set: updateFields }, { returnDocument: "after" });

        if (!result.value) {
            return res.status(404).json({ message: "User not found!" })
        }
        res.send(result.value);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error!");
    }

}


const deleteUserProfile = async (req, res) => {
    const currentID = req.params.id;
    try {



        await connectClient();
        const db = client.db('githubClone');
        const usersCollection = db.collection('users');

        const result = await usersCollection.deleteOne({
            _id: new ObjectId(currentID)
        });

        if (!result.deleteCount) {
            return res.status(404).json({ message: "User not found!" })
        }
        res.json({message:"User profile deleted"});
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error!");
    }
}

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
};