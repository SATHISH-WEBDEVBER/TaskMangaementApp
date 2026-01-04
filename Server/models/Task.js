const mongoose = require('mongoose');

// This defines what a "Task" looks like in the database
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);