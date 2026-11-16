const express = require("express");
const mongoose = require("mongoose");

const Task = require("../models/Task");
const WorkSession = require("../models/WorkSession");
const ActiveTimer = require("../models/ActiveTimer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All timer routes require login
router.use(authMiddleware);

// GET the active timer for the logged-in user
router.get("/", async (req, res) => {
  try {
    const timer = await ActiveTimer.findOne({
      userId: req.userId,
    }).lean();

    // No active timer exists
    if (!timer) {
      return res.json({
        success: true,
        timer: null,
      });
    }

    // Find the task associated with this timer
    const task = await Task.findOne({
      _id: timer.taskId,
      userId: req.userId,
    }).lean();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "The task associated with this timer was not found",
      });
    }

    // Calculate accurate elapsed time
    let elapsedSeconds = timer.elapsedSeconds || 0;

    if (timer.status === "running" && timer.startedAt) {
      const runningSeconds = Math.floor(
        (Date.now() - new Date(timer.startedAt).getTime()) / 1000,
      );

      elapsedSeconds += Math.max(0, runningSeconds);
    }

    res.json({
      success: true,
      timer: {
        status: timer.status,
        elapsedSeconds,
        startedAt: timer.startedAt,
        task: {
          id: task._id.toString(),
          title: task.title,
          priority: task.priority,
          estimatedDuration: task.estimatedDuration,
          actualDurationSeconds: task.actualDurationSeconds ?? 0,
          deadline: task.deadline || "",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch active timer",
    });
  }
});

// START a timer for a selected task
router.post("/start", async (req, res) => {
  try {
    const { taskId } = req.body;

    // Validate task ID
    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Valid task ID is required",
      });
    }

    // Check whether the task belongs to the logged-in user
    const task = await Task.findOne({
      _id: taskId,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Prevent starting another timer
    const existingTimer = await ActiveTimer.findOne({
      userId: req.userId,
    });

    if (existingTimer) {
      return res.status(409).json({
        success: false,
        message: "A timer already exists. Stop it before starting another.",
      });
    }

    // Create a new work session
    const session = await WorkSession.create({
      userId: req.userId,
      taskId: task._id,
      startedAt: new Date(),
    });

    // Create the active timer
    const timer = await ActiveTimer.create({
      userId: req.userId,
      taskId: task._id,
      status: "running",
      currentSessionId: session._id,
      startedAt: session.startedAt,
      elapsedSeconds: 0,
    });

    res.status(201).json({
      success: true,
      message: "Timer started successfully",
      timer: {
        status: timer.status,
        elapsedSeconds: timer.elapsedSeconds,
        startedAt: timer.startedAt,
        task: {
          id: task._id.toString(),
          title: task.title,
          priority: task.priority,
          estimatedDuration: task.estimatedDuration,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to start timer",
    });
  }
});

// PAUSE the currently running timer
router.post("/pause", async (req, res) => {
  try {
    const timer = await ActiveTimer.findOne({
      userId: req.userId,
      status: "running",
    });

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: "No running timer found",
      });
    }

    // Find the current work session
    const session = await WorkSession.findOne({
      _id: timer.currentSessionId,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Current work session not found",
      });
    }

    // Calculate actual time spent in this session
    const endedAt = new Date();

    const durationSeconds = Math.max(
      0,
      Math.floor(
        (endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000,
      ),
    );

    // Save the completed work session
    session.endedAt = endedAt;
    session.durationSeconds = durationSeconds;

    await session.save();

    // Update the active timer
    timer.elapsedSeconds += durationSeconds;
    timer.status = "paused";
    timer.startedAt = null;
    timer.currentSessionId = null;

    await timer.save();

    res.json({
      success: true,
      message: "Timer paused successfully",
      timer: {
        status: timer.status,
        elapsedSeconds: timer.elapsedSeconds,
        taskId: timer.taskId.toString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to pause timer",
    });
  }
});

// RESUME a paused timer
router.post("/resume", async (req, res) => {
  try {
    // Find the user's paused timer
    const timer = await ActiveTimer.findOne({
      userId: req.userId,
      status: "paused",
    });

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: "No paused timer found",
      });
    }

    // Verify that the associated task still exists
    const task = await Task.findOne({
      _id: timer.taskId,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Create a new work session
    const session = await WorkSession.create({
      userId: req.userId,
      taskId: timer.taskId,
      startedAt: new Date(),
    });

    // Resume the existing timer
    timer.status = "running";
    timer.currentSessionId = session._id;
    timer.startedAt = session.startedAt;

    await timer.save();

    res.json({
      success: true,
      message: "Timer resumed successfully",
      timer: {
        status: timer.status,
        elapsedSeconds: timer.elapsedSeconds,
        startedAt: timer.startedAt,
        task: {
          id: task._id.toString(),
          title: task.title,
          priority: task.priority,
          estimatedDuration: task.estimatedDuration,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to resume timer",
    });
  }
});

// STOP the active timer and save total actual duration
router.post("/stop", async (req, res) => {
  const dbSession = await mongoose.startSession();

  try {
    let result = null;

    await dbSession.withTransaction(async () => {
      // Find the user's active timer
      const timer = await ActiveTimer.findOne({
        userId: req.userId,
      }).session(dbSession);

      if (!timer) {
        result = {
          status: 404,
          body: {
            success: false,
            message: "No active timer found",
          },
        };
        return;
      }

      let totalElapsedSeconds = timer.elapsedSeconds || 0;

      // If running, close the current work session
      if (timer.status === "running") {
        const session = await WorkSession.findOne({
          _id: timer.currentSessionId,
          userId: req.userId,
          endedAt: null,
        }).session(dbSession);

        if (!session) {
          throw new Error("Current work session not found");
        }

        const endedAt = new Date();

        const durationSeconds = Math.max(
          0,
          Math.floor(
            (endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000,
          ),
        );

        session.endedAt = endedAt;
        session.durationSeconds = durationSeconds;

        await session.save({ session: dbSession });

        totalElapsedSeconds += durationSeconds;
      }

      // Find the task belonging to this user
      const task = await Task.findOne({
        _id: timer.taskId,
        userId: req.userId,
      }).session(dbSession);

      if (!task) {
        throw new Error("Associated task not found");
      }

      // Add the total tracked time to the task
      const updateResult = await Task.updateOne(
        {
          _id: task._id,
          userId: req.userId,
        },
        {
          $inc: {
            actualDurationSeconds: totalElapsedSeconds,
          },
        },
        { session: dbSession },
      );

      const rawTask = await Task.collection.findOne(
        {
          _id: task._id,
          userId: task.userId,
        },
        {
          session: dbSession,
        },
      );

      const updatedTask = await Task.findOne({
        _id: task._id,
        userId: req.userId,
      }).session(dbSession);

      // Remove the active timer
      await ActiveTimer.deleteOne(
        {
          _id: timer._id,
          userId: req.userId,
        },
        { session: dbSession },
      );

      result = {
        status: 200,
        body: {
          success: true,
          message: "Timer stopped successfully",
          actualDurationSeconds: totalElapsedSeconds,
          task: {
            id: task._id.toString(),
            title: task.title,
            totalActualDurationSeconds:
              (task.actualDurationSeconds || 0) + totalElapsedSeconds,
          },
        },
      };
    });

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Unable to stop timer",
      });
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Stop timer error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to stop timer",
    });
  } finally {
    await dbSession.endSession();
  }
});

// GET the logged-in user's work session history
router.get("/history", async (req, res) => {
  try {
    const sessions = await WorkSession.find({
      userId: req.userId,
      endedAt: { $ne: null },
    })
      .populate({
        path: "taskId",
        select: "title priority",
      })
      .sort({ endedAt: -1 })
      .lean();

    const formattedSessions = sessions.map((session) => ({
      id: session._id.toString(),
      task: session.taskId
        ? {
            id: session.taskId._id.toString(),
            title: session.taskId.title,
            priority: session.taskId.priority,
          }
        : null,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationSeconds: session.durationSeconds || 0,
    }));

    return res.json({
      success: true,
      count: formattedSessions.length,
      sessions: formattedSessions,
    });
  } catch (error) {
    console.error("Timer history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch work session history",
    });
  }
});

module.exports = router;
