
const mongoose = require("mongoose");

const activeTimerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    status: {
      type: String,
      enum: ["running", "paused"],
      default: "paused",
    },

    currentSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkSession",
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    elapsedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ActiveTimer", activeTimerSchema);
