import { useEffect, useState } from "react";
import { useTimer } from "../hooks/useTimer";

function Timer({ selectedTask, completeSession }) {

  const [mode, setMode] = useState("focus");
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const durations = {
    focus: 25,
    short: 10,
    long: 15,
  };

  const {
    minutes,
    remainingSeconds,
    isRunning,
    start,
    pause,
    reset,
  } = useTimer(durations[mode]);

  // Reset completion status when task changes
  useEffect(() => {
    setSessionCompleted(false);

    if (selectedTask) {
      reset(durations.focus);
    }
  }, [selectedTask]);

  // Detect completed focus session
  useEffect(() => {
    if (
      mode === "focus" &&
      minutes === 0 &&
      remainingSeconds === 0 &&
      selectedTask &&
      !sessionCompleted
    ) {
      completeSession(durations.focus);
      setSessionCompleted(true);
    }
  }, [
    mode,
    minutes,
    remainingSeconds,
    selectedTask,
    completeSession,
    sessionCompleted,
  ]);

  const changeMode = (newMode) => {
    setMode(newMode);
    setSessionCompleted(false);
    reset(durations[newMode]);
  };

  const handleReset = () => {
    setSessionCompleted(false);
    reset(durations[mode]);
  };

  const formattedMinutes = String(minutes).padStart(2, "0");

  const formattedSeconds =
    String(remainingSeconds).padStart(2, "0");

  const modeName = {
    focus: "Focus",
    short: "Short Break",
    long: "Long Break",
  };

  return (
    <section className="timer-card">

      <div className="timer-header">

        <div>

          <span className="timer-label">
            FOCUS SESSION
          </span>

          <h2>
            {modeName[mode]}
          </h2>

        </div>

        <span className="session-count">
          {sessionCompleted
            ? "Session completed ✓"
            : "Session in progress"}
        </span>

      </div>


      {selectedTask && (
        <div className="current-task">

          <span>
            🎯 Focusing on
          </span>

          <strong>
            {selectedTask.title}
          </strong>

        </div>
      )}


      {!selectedTask && (
        <div className="current-task">
          <span>
            🎯 Select a task to start focusing
          </span>
        </div>
      )}


      <div className="timer">

        <div className="timer-circle">

          <div className="timer-content">

            <span className="timer-mode">
              {sessionCompleted
                ? "Completed!"
                : isRunning
                  ? "Focusing"
                  : "Ready"}
            </span>

            <span className="time">
              {formattedMinutes}:{formattedSeconds}
            </span>

          </div>

        </div>

      </div>


      <div className="timer-controls">

        {!isRunning ? (

          <button
            className="start-button"
            onClick={start}
            disabled={!selectedTask || sessionCompleted}
          >
            ▶ Start Focus
          </button>

        ) : (

          <button
            className="start-button"
            onClick={pause}
          >
            ⏸ Pause
          </button>

        )}

      </div>


      <div className="timer-settings">

        <button
          className={mode === "focus" ? "selected-mode" : ""}
          onClick={() => changeMode("focus")}
        >
          25 min
        </button>

        <button
          className={mode === "short" ? "selected-mode" : ""}
          onClick={() => changeMode("short")}
        >
          Short break
        </button>

        <button
          className={mode === "long" ? "selected-mode" : ""}
          onClick={() => changeMode("long")}
        >
          Long break
        </button>

        <button onClick={handleReset}>
          Reset
        </button>

      </div>

    </section>
  );
}

export default Timer;