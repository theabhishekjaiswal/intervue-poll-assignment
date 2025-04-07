const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 2;
      },
      message: 'Poll must have at least 2 options'
    }
  },
  timeLimit: {
    type: Number,
    default: 60
  },
  answers: {
    type: Map,
    of: String,
    default: {}
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Poll', PollSchema);
