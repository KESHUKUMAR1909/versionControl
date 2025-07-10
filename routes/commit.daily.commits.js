const express = require('express');
const router = express.Router();
const Commit = require('../models/Commit'); // Ensure correct path

// GET /daily-commits
router.get('/daily-commits', async (req, res) => {
  try {
    console.log("✅ /daily-commits route hit");
    const test = await Commit.findOne();
    console.log("🧪 Sample commit:", test);

    const activity = await Commit.aggregate([
      {
        $match: { date: { $exists: true } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json(activity);
  } catch (err) {
    console.error("❌ Error in /daily-commits route:", err);
    res.status(500).json({ error: "Failed to fetch commit activity." });
  }
});

module.exports = router;
