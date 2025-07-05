const mongoose = require("mongoose");
const Repository = require('../models/repoModel.js');
const User = require('../models/userModel.js');
const Issue = require('../models/issueModel.js');

// CREATE Issue
const createIssue = async (req, res) => {
    const { title, description } = req.body;
    const { id } = req.params; // repository ID

    try {
        const issue = new Issue({
            title,
            description,
            repository: id,
        });

        await issue.save();
        res.status(201).json(issue);
    } catch (err) {
        console.error("Error creating issue:", err);
        res.status(500).json({ error: "Internal Server Error while creating issue" });
    }
};

// UPDATE Issue by ID
const updateIssueById = async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }

        issue.title = title || issue.title;
        issue.description = description || issue.description;
        issue.status = status || issue.status;

        await issue.save();

        res.json({ message: "Issue updated successfully", issue });
    } catch (err) {
        console.error("Error updating issue:", err);
        res.status(500).json({ error: "Internal Server Error while updating issue" });
    }
};

// DELETE Issue by ID
const deleteIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const issue = await Issue.findByIdAndDelete(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }

        res.json({ message: "Issue deleted successfully" });
    } catch (err) {
        console.error("Error deleting issue:", err);
        res.status(500).json({ error: "Internal Server Error while deleting issue" });
    }
};

// GET all issues for a repository
const getAllIssues = async (req, res) => {
    const { id } = req.params; // repository ID

    try {
        const issues = await Issue.find({ repository: id });
        if (!issues || issues.length === 0) {
            return res.status(404).json({ error: "No issues found for this repository" });
        }

        res.status(200).json({ issues });
    } catch (err) {
        console.error("Error fetching issues:", err);
        res.status(500).json({ error: "Internal Server Error while fetching issues" });
    }
};

// GET single issue by ID
const getIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }

        res.json({ issue });
    } catch (err) {
        console.error("Error fetching issue by ID:", err);
        res.status(500).json({ error: "Internal Server Error while fetching issue" });
    }
};

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById
};
