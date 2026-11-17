
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = "https://focusflow-backend-ktmp.onrender.com";


const timerRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("focusflow-token");

  if (!token) {
    throw new Error("Please log in again to use the timer.");
  }

  const response = await fetch(`${API_BASE_URL}/api/timer${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error("Non-JSON API response:", responseText);

    throw new Error(
      `Server returned invalid JSON. Status: ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Timer request failed.");
  }

  return data;
};


function Timer({ selectedTask }) {
  const [serverTimer, setServerTimer] = useState(null);
  const [serverElapsedSeconds, setServerElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [timerLoading, setTimerLoading] = useState(true);

  const warningPlayed = useRef(false);
  const alarmAudio = useRef(null);

  // Convert backend responses into one consistent timer format
  const updateTimer = (data) => {
    if (!data.timer) {
      setServerTimer(null);
      setServerElapsedSeconds(0);
      return;
    }

    const timer = {
      ...data.timer,
      task: data.timer.task || data.task || selectedTask,
    };

    setServerTimer(timer);
    setServerElapsedSeconds(timer.elapsedSeconds || 0);
    setCurrentTime(Date.now());
  };

  // Select task and restore its individual timer
  useEffect(() => {
    let isMounted = true;

    const selectTask = async () => {
      if (!selectedTask?.id) {
        setServerTimer(null);
        setServerElapsedSeconds(0);
        setTimerLoading(false);
        return;
      }

      setTimerLoading(true);
      warningPlayed.current = false;

      try {
        const data = await timerRequest("/select", {
          method: "POST",
          body: JSON.stringify({
            taskId: selectedTask.id,
          }),
        });

        if (isMounted) {
          updateTimer(data);
        }
      } catch (error) {
        console.error("Task timer loading failed:", error.message);
      } finally {
        if (isMounted) {
          setTimerLoading(false);
        }
      }
    };

    selectTask();

    return () => {
      isMounted = false;
    };
  }, [selectedTask?.id]);

  // Update display every second while running
  useEffect(() => {
    if (serverTimer?.status !== "running") return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [serverTimer?.status, serverTimer?.startedAt]);

  // Calculate accurate elapsed time
  const actualElapsedSeconds =
    serverElapsedSeconds +
    (serverTimer?.status === "running" && serverTimer?.startedAt
      ? Math.max(
        0,
        Math.floor(
          (currentTime -
            new Date(serverTimer.startedAt).getTime()) /
          1000
        )
      )
      : 0);

  // Use the selected task's estimated duration
  const estimatedDurationSeconds =
    Number(
      serverTimer?.task?.estimatedDuration ??
      selectedTask?.estimatedDuration ??
      30
    ) * 60;

  const remainingTimeSeconds = Math.max(
    0,
    estimatedDurationSeconds - actualElapsedSeconds
  );

  const overtimeSeconds = Math.max(
    0,
    actualElapsedSeconds - estimatedDurationSeconds
  );

  const isOvertime =
    actualElapsedSeconds >= estimatedDurationSeconds;

  // Play alarm when estimated time expires
  useEffect(() => {
    if (
      serverTimer?.status === "running" &&
      isOvertime &&
      !warningPlayed.current
    ) {
      warningPlayed.current = true;

      const audio = new Audio(
        `${import.meta.env.BASE_URL}sounds/alarm.mp3`
      );

      audio.volume = 0.8;
      alarmAudio.current = audio;

      audio.play().catch((error) => {
        console.log("Alarm could not play:", error);
      });
    }
  }, [isOvertime, serverTimer?.status]);

  const stopAlarm = () => {
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
      alarmAudio.current = null;
    }
  };

  // START
  const handleStart = async () => {
    try {
      setTimerLoading(true);

      const data = await timerRequest("/start", {
        method: "POST",
        body: JSON.stringify({
          taskId: selectedTask.id,
        }),
      });

      updateTimer(data);
      warningPlayed.current = false;
    } catch (error) {
      alert(error.message);
    } finally {
      setTimerLoading(false);
    }
  };

  // PAUSE
  const handlePause = async () => {
    try {
      setTimerLoading(true);

      await timerRequest("/pause", {
        method: "POST",
      });

      const data = await timerRequest("/select", {
        method: "POST",
        body: JSON.stringify({
          taskId: selectedTask.id,
        }),
      });

      updateTimer(data);
      stopAlarm();
    } catch (error) {
      alert(error.message);
    } finally {
      setTimerLoading(false);
    }
  };

  // RESUME
  const handleResume = async () => {
    try {
      setTimerLoading(true);

      const data = await timerRequest("/resume", {
        method: "POST",
        body: JSON.stringify({
          taskId: selectedTask.id,
        }),
      });

      updateTimer(data);
      warningPlayed.current = false;
    } catch (error) {
      alert(error.message);
    } finally {
      setTimerLoading(false);
    }
  };

  // STOP - save unfinished progress
  const handleStop = async () => {
    try {
      setTimerLoading(true);

      const data = await timerRequest("/stop", {
        method: "POST",
        body: JSON.stringify({
          taskId: selectedTask.id,
        }),
      });

      updateTimer({
        timer: {
          status: "stopped",
          elapsedSeconds: data.elapsedSeconds,
          task: {
            ...selectedTask,
            ...(data.task || {}),
          },
        },
      });

      stopAlarm();
      warningPlayed.current = false;

      alert("Timer stopped. Your progress has been saved.");
    } catch (error) {
      alert(error.message);
    } finally {
      setTimerLoading(false);
    }
  };

  // RESET - backend endpoint will be added in the next step
  const handleReset = async () => {
    if (!window.confirm("Reset this task's timer progress?")) return;

    try {
      setTimerLoading(true);

      const data = await timerRequest("/reset", {
        method: "POST",
        body: JSON.stringify({
          taskId: selectedTask.id,
        }),
      });

      updateTimer(data);
      stopAlarm();
      warningPlayed.current = false;
    } catch (error) {
      alert(error.message);
    } finally {
      setTimerLoading(false);
    }
  };

  // COMPLETE - backend endpoint will be added in the next step
  const handleComplete = async () => {
    if (!window.confirm("Mark this task as completed?")) return;

    try {
      setTimerLoading(true);

      const data = await timerRequest("/complete", {
        method: "POST",
        body: JSON.stringify({
          taskId: selectedTask.id,
        }),
      });

      setServerTimer(null);
      setServerElapsedSeconds(0);
      stopAlarm();
      warningPlayed.current = false;

      alert("Task completed successfully!");

      console.log("Task completion response:", data);
    } catch (error) {
      alert(error.message);
    } finally {
      setTimerLoading(false);
    }
  };

  const displaySeconds = isOvertime
    ? overtimeSeconds
    : remainingTimeSeconds;

  const formattedMinutes = String(
    Math.floor(displaySeconds / 60)
  ).padStart(2, "0");

  const formattedSeconds = String(
    displaySeconds % 60
  ).padStart(2, "0");

  const isRunning = serverTimer?.status === "running";
  const isPaused = serverTimer?.status === "paused";
  const isStopped = serverTimer?.status === "stopped";

  console.log("Timer Debug:", {
    selectedTask,
    serverTimer,
    isRunning,
    isPaused,
    timerLoading
  });

  return (
    <section className="timer-card">

      <div className="timer-header">
        <div>
          <span className="timer-label">FOCUS SESSION</span>
          <h2>Task Focus</h2>
        </div>

        <span className="session-count">
          {isRunning
            ? isOvertime
              ? "Overtime"
              : "Session in progress"
            : isPaused
              ? "Session paused"
              : isStopped
                ? "Session stopped"
                : "Ready to focus"}
        </span>
      </div>

      {selectedTask ? (
        <div className="current-task">
          <span>🎯 Focusing on</span>
          <strong>{selectedTask.title}</strong>
          <span>
            Estimated: {selectedTask.estimatedDuration || 30} minutes
          </span>
        </div>
      ) : (
        <div className="current-task">
          🎯 Select a task to start focusing
        </div>
      )}

      <div className="timer">
        <div className="timer-circle">
          <div className="timer-content">

            <span className="timer-mode">
              {timerLoading
                ? "Loading..."
                : !selectedTask
                  ? "Select a task"
                  : isRunning
                    ? isOvertime
                      ? "Overtime"
                      : "Focusing"
                    : isPaused
                      ? "Paused"
                      : isStopped
                        ? "Stopped"
                        : "Ready"}
            </span>

            <span className="time">
              {formattedMinutes}:{formattedSeconds}
            </span>

          </div>
        </div>
      </div>

      <div className="timer-info">
        {isOvertime && (
          <p className="overtime-text">
            Overtime: {Math.floor(overtimeSeconds / 60)}m{" "}
            {overtimeSeconds % 60}s
          </p>
        )}
      </div>


      <div className="timer-controls">

        {!isRunning && !isPaused && (
          <button
            className="start-button"
            onClick={handleStart}
            disabled={!selectedTask || timerLoading}
          >
            Start
          </button>
        )}

        {isRunning && (
          <button
            className="pause-button"
            onClick={handlePause}
            disabled={timerLoading}
          >
            Pause
          </button>
        )}

        {isPaused && (
          <button
            className="resume-button"
            onClick={handleResume}
            disabled={timerLoading}
          >
            Resume
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            className="stop-button"
            onClick={handleStop}
            disabled={timerLoading}
          >
            Stop
          </button>
        )}

        {selectedTask && (
          <>
            <button
              className="reset-button"
              onClick={handleReset}
              disabled={timerLoading || isRunning}
            >
              Reset
            </button>

            <button
              className="complete-button"
              onClick={handleComplete}
              disabled={timerLoading}
            >
              Complete
            </button>
          </>
        )}

      </div>


    </section>
  );
}

export default Timer;
