const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGO_URI;
let client;

// ✅ Connect to MongoDB (without deprecated options)
async function connectClient() {
  if (!client) {
    client = new MongoClient(uri); // Removed deprecated options
    await client.connect();
  }
}

// ✅ User Signup
async function signup(req, res) {
  const { username, password, email } = req.body;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, userId: result.insertedId });
  } catch (err) {
    console.error("Error during signup:", err.message);
    res.status(500).send("Server error");
  }
}

// ✅ User Login
async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }

    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).send("Server error!");
  }
}

// ✅ Get All Users
async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error("Error during fetching:", err.message);
    res.status(500).send("Server error!");
  }
}

// ✅ Get User Profile by ID
async function getUserProfile(req, res) {
  const currentID = req.params.id;
  console.log("🔍 Entered getUserProfile");
  console.log("📦 Received ID:", currentID);

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    // Try both ObjectId and string fallback
    let user = await usersCollection.findOne({
      _id: ObjectId.isValid(currentID) ? new ObjectId(currentID) : currentID,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    console.log("✅ User found:", user.username || user.email || user._id);
    return res.status(200).json(user);
  } catch (err) {
    console.error("🔥 Error during fetching:", err.message);
    return res.status(500).send("Server error!");
  }
}

// ✅ Update User Profile
async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    let updateFields = { email };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(currentID) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.send(result.value);
  } catch (err) {
    console.error("Error during updating:", err.message);
    res.status(500).send("Server error!");
  }
}

// ✅ Delete User Profile
async function deleteUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentID),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during deleting:", err.message);
    res.status(500).send("Server error!");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
