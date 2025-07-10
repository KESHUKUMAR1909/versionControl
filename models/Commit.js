const mongoose = require('mongoose');

const CommitSchema = new mongoose.Schema({
  repo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
  commitId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Prevent OverwriteModelError by checking if model already exists
const Commit = mongoose.models.Commit || mongoose.model('Commit', CommitSchema);

module.exports = Commit;
