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
// START a timer for a selected task
router.post("/start", async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Valid task ID is required",
      });
    }

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

    if (task.completed) {
      return res.status(400).json({
        success: false,
        message: "Cannot start a completed task",
      });
    }

    // Do not start another timer while one is already running.
    // Task switching will be handled by the /select route.
    const runningTimer = await ActiveTimer.findOne({
      userId: req.userId,
      status: "running",
    });

    if (runningTimer && runningTimer.taskId.toString() !== taskId) {
      return res.status(409).json({
        success: false,
        message: "Another task timer is running. Select the task first.",
      });
    }

    let timer = await ActiveTimer.findOne({
      userId: req.userId,
      taskId,
    });

    if (timer && timer.status === "running") {
      return res.status(409).json({
        success: false,
        message: "This task timer is already running",
      });
    }

    const startedAt = new Date();

    const workSession = await WorkSession.create({
      userId: req.userId,
      taskId: task._id,
      startedAt,
    });

    if (!timer) {
      timer = await ActiveTimer.create({
        userId: req.userId,
        taskId: task._id,
        status: "running",
        currentSessionId: workSession._id,
        startedAt,
        elapsedSeconds: task.timerElapsedSeconds || 0,
      });
    } else {
      timer.status = "running";
      timer.currentSessionId = workSession._id;
      timer.startedAt = startedAt;
      await timer.save();
    }

    return res.status(200).json({
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
          actualDurationSeconds: task.actualDurationSeconds || 0,
        },
      },
    });
  } catch (error) {
    console.error("Start timer error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to start timer",
    });
  }
});
// STOP the timer and save unfinished progress
router.post("/stop", async (req, res) => {
  const dbSession = await mongoose.startSession();

  try {
    let result = null;

    await dbSession.withTransaction(async () => {
      const { taskId } = req.body;

      // A valid task ID is required
      if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
        result = {
          status: 400,
          body: {
            success: false,
            message: "Valid task ID is required",
          },
        };
        return;
      }

      // Find the timer for this specific task
      const timerQuery = {
        userId: req.userId,
        taskId,
      };

      const timer = await ActiveTimer.findOne(timerQuery)
        .sort({ updatedAt: -1 })
        .session(dbSession);

      if (!timer) {
        result = {
          status: 404,
          body: {
            success: false,
            message: "No timer found to stop",
          },
        };
        return;
      }

      let totalElapsedSeconds = timer.elapsedSeconds || 0;

      // Close the current work session if the timer is running
      if (timer.status === "running" && timer.currentSessionId) {
        const session = await WorkSession.findOne({
          _id: timer.currentSessionId,
          userId: req.userId,
          endedAt: null,
        }).session(dbSession);

        if (session) {
          const endedAt = new Date();

          const durationSeconds = Math.max(
            0,
            Math.floor(
              (endedAt.getTime() - new Date(session.startedAt).getTime()) /
                1000,
            ),
          );

          session.endedAt = endedAt;
          session.durationSeconds = durationSeconds;

          await session.save({ session: dbSession });

          totalElapsedSeconds += durationSeconds;
        }
      }

      // Find the task
      const task = await Task.findOne({
        _id: timer.taskId,
        userId: req.userId,
      }).session(dbSession);

      if (!task) {
        throw new Error("Associated task not found");
      }

      // Save unfinished time separately.
      // Do NOT add it to actualDurationSeconds.
      task.timerElapsedSeconds = totalElapsedSeconds;
      await task.save({ session: dbSession });

      // Keep the timer record so its progress can be restored later
      timer.elapsedSeconds = totalElapsedSeconds;
      timer.status = "stopped";
      timer.startedAt = null;
      timer.currentSessionId = null;

      await timer.save({ session: dbSession });

      result = {
        status: 200,
        body: {
          success: true,
          message: "Timer stopped. Progress saved.",
          elapsedSeconds: totalElapsedSeconds,
          task: {
            id: task._id.toString(),
            title: task.title,
            timerElapsedSeconds: task.timerElapsedSeconds,
            actualDurationSeconds: task.actualDurationSeconds || 0,
          },
        },
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Stop timer error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to stop timer",
    });
  } finally {
    await dbSession.endSession();
  }
});

// SELECT a task and automatically pause the previous running timer
router.post("/select", async (req, res) => {
  const dbSession = await mongoose.startSession();

  try {
    let result = null;

    await dbSession.withTransaction(async () => {
      const { taskId } = req.body;

      if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
        result = {
          status: 400,
          body: {
            success: false,
            message: "Valid task ID is required",
          },
        };
        return;
      }

      const selectedTask = await Task.findOne({
        _id: taskId,
        userId: req.userId,
      }).session(dbSession);

      if (!selectedTask) {
        result = {
          status: 404,
          body: {
            success: false,
            message: "Task not found",
          },
        };
        return;
      }

      // Find any currently running timer
      const runningTimer = await ActiveTimer.findOne({
        userId: req.userId,
        status: "running",
      }).session(dbSession);

      // Pause the previous task if it is different
      if (runningTimer && runningTimer.taskId.toString() !== taskId) {
        const endedAt = new Date();
        let elapsed = runningTimer.elapsedSeconds || 0;

        if (runningTimer.currentSessionId) {
          const session = await WorkSession.findOne({
            _id: runningTimer.currentSessionId,
            userId: req.userId,
            endedAt: null,
          }).session(dbSession);

          if (session) {
            const duration = Math.max(
              0,
              Math.floor(
                (endedAt.getTime() - new Date(session.startedAt).getTime()) /
                  1000,
              ),
            );

            session.endedAt = endedAt;
            session.durationSeconds = duration;

            await session.save({ session: dbSession });

            elapsed += duration;
          }
        }

        runningTimer.elapsedSeconds = elapsed;
        runningTimer.status = "paused";
        runningTimer.startedAt = null;
        runningTimer.currentSessionId = null;

        await runningTimer.save({ session: dbSession });

        await Task.updateOne(
          {
            _id: runningTimer.taskId,
            userId: req.userId,
          },
          {
            $set: {
              timerElapsedSeconds: elapsed,
            },
          },
          { session: dbSession },
        );
      }

      // Find the selected task's own timer
      const selectedTimer = await ActiveTimer.findOne({
        userId: req.userId,
        taskId: selectedTask._id,
      }).session(dbSession);

      result = {
        status: 200,
        body: {
          success: true,
          message: "Task selected successfully",
          timer: selectedTimer
            ? {
                status: selectedTimer.status,
                elapsedSeconds: selectedTimer.elapsedSeconds,
                startedAt: selectedTimer.startedAt,
              }
            : {
                status: "stopped",
                elapsedSeconds: selectedTask.timerElapsedSeconds || 0,
                startedAt: null,
              },
          task: {
            id: selectedTask._id.toString(),
            title: selectedTask.title,
            priority: selectedTask.priority,
            estimatedDuration: selectedTask.estimatedDuration,
            actualDurationSeconds: selectedTask.actualDurationSeconds || 0,
          },
        },
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Select timer error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to select task timer",
    });
  } finally {
    await dbSession.endSession();
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

    // Also save unfinished progress in the task
    await Task.updateOne(
      {
        _id: timer.taskId,
        userId: req.userId,
      },
      {
        $set: {
          timerElapsedSeconds: timer.elapsedSeconds,
        },
      },
    );

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
// RESUME a specific task timer
router.post("/resume", async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Valid task ID is required",
      });
    }

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

    if (task.completed) {
      return res.status(400).json({
        success: false,
        message: "Cannot resume a completed task",
      });
    }

    const runningTimer = await ActiveTimer.findOne({
      userId: req.userId,
      status: "running",
    });

    if (runningTimer) {
      return res.status(409).json({
        success: false,
        message: "Another timer is already running",
      });
    }

    const timer = await ActiveTimer.findOne({
      userId: req.userId,
      taskId,
    });

    if (!timer || !["paused", "stopped"].includes(timer.status)) {
      return res.status(404).json({
        success: false,
        message: "No saved timer found for this task",
      });
    }

    const startedAt = new Date();

    const session = await WorkSession.create({
      userId: req.userId,
      taskId: task._id,
      startedAt,
    });

    timer.status = "running";
    timer.currentSessionId = session._id;
    timer.startedAt = startedAt;

    await timer.save();

    return res.json({
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
          actualDurationSeconds: task.actualDurationSeconds || 0,
        },
      },
    });
  } catch (error) {
    console.error("Resume timer error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to resume timer",
    });
  }
});

// STOP the active timer and save total actual duration

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
