const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  assignedMember: {
      type: String,
      required: true,
      trim: true,
  },
}, 
{
  timestamps: true,
  });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
