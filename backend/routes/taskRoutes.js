const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All task routes require login
router.use(authMiddleware);

// Convert MongoDB documents to the format expected by FocusFlow
const formatTask = (task) => ({
  id: task._id.toString(),
  title: task.title,
  priority: task.priority,
  skill: task.skill || "Other",
  deadline: task.deadline || "",
  scheduledStartAt: task.scheduledStartAt || null,
  scheduledEndAt: task.scheduledEndAt || null,
  estimatedDuration: task.estimatedDuration,
  actualDurationSeconds: task.actualDurationSeconds,
  completed: task.completed,
  createdAt: task.createdAt,
  completedAt: task.completedAt,
});

// GET all tasks belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    const formattedTasks = tasks.map((task) => ({
      ...formatTask(task),
      actualDurationSeconds: task.actualDurationSeconds ?? 0,
    }));

    res.json({
      success: true,
      tasks: formattedTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
});

// CREATE a task
router.post("/", async (req, res) => {
  try {
    const {
      title,
      priority,
      skill,
      deadline,
      estimatedDuration,
      scheduledStartAt,
      scheduledEndAt,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    // Validate scheduled date and time
    if (
      (scheduledStartAt && !scheduledEndAt) ||
      (!scheduledStartAt && scheduledEndAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "Both scheduled start and end times are required.",
      });
    }

    if (scheduledStartAt && scheduledEndAt) {
      const start = new Date(scheduledStartAt);
      const end = new Date(scheduledEndAt);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
      ) {
        return res.status(400).json({
          success: false,
          message: "Scheduled end time must be later than start time.",
        });
      }
    }

    const task = await Task.create({
      userId: req.userId,
      title: title.trim(),
      priority: priority || "Medium",
      skill: skill?.trim() || "Other",
      deadline: deadline || "",
      scheduledStartAt: scheduledStartAt || null,
      scheduledEndAt: scheduledEndAt || null,
      estimatedDuration: Number(estimatedDuration) || 30,
      completed: false,
      completedAt: null,
    });

    res.status(201).json({
      success: true,
      task: formatTask(task),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create task",
    });
  }
});

// UPDATE a task
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const allowedFields = [
      "title",
      "priority",
      "skill",
      "deadline",
      "scheduledStartAt",
      "scheduledEndAt",
      "estimatedDuration",
      "completed",
      "completedAt",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validate updated schedule using existing values when needed
    const existingTask = await Task.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const startValue =
      updates.scheduledStartAt !== undefined
        ? updates.scheduledStartAt
        : existingTask.scheduledStartAt;

    const endValue =
      updates.scheduledEndAt !== undefined
        ? updates.scheduledEndAt
        : existingTask.scheduledEndAt;

    if ((startValue && !endValue) || (!startValue && endValue)) {
      return res.status(400).json({
        success: false,
        message: "Both scheduled start and end times are required.",
      });
    }

    if (startValue && endValue) {
      const start = new Date(startValue);
      const end = new Date(endValue);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
      ) {
        return res.status(400).json({
          success: false,
          message: "Scheduled end time must be later than start time.",
        });
      }
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.skill !== undefined) {
      updates.skill = updates.skill.trim() || "Other";
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updates,
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      task: formatTask(task),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update task",
    });
  }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
});

module.exports = router;
