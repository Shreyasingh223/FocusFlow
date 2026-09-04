import { useEffect, useRef, useState } from "react";
import { useTimer } from "../hooks/useTimer";

function Timer({ selectedTask, completeSession }) {
  const [mode, setMode] = useState("focus");
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  // Prevent the 5-minute warning from playing more than once
  const warningPlayed = useRef(false);
  const alarmAudio = useRef(null);

  const durations = {
    focus: 25,
    short: 5,
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

  // 🔔 Play a sound
  const playSound = (type) => {
    const audio = new Audio(
      type === "warning"
        ? `${import.meta.env.BASE_URL}sounds/warning.mp3`
        : `${import.meta.env.BASE_URL}sounds/alarm.mp3`
    );

    audio.volume = 0.8;

    if (type === "alarm") {
      alarmAudio.current = audio;
    }

    audio.play().catch((error) => {
      console.log("Audio could not play:", error);
    });
  };

  const stopAlarm = () => {
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
      alarmAudio.current = null;
    }
  };

  // Reset completion status when task changes
  useEffect(() => {
    setSessionCompleted(false);
    warningPlayed.current = false;

    if (selectedTask) {
      reset(durations.focus);
    }
  }, [selectedTask]);

  // 🔔 5-minute warning
  useEffect(() => {
    if (
      mode === "focus" &&
      minutes === 0 &&
      remainingSeconds === 0 &&
      selectedTask &&
      !sessionCompleted
    ) {
      playSound("alarm");

      completeSession(durations.focus);
      setSessionCompleted(true);
      setShowCompletionPopup(true);
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
    warningPlayed.current = false;
    reset(durations[newMode]);
  };

  const handleReset = () => {
    setSessionCompleted(false);
    warningPlayed.current = false;
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

  const handleCompletionOK = () => {
    stopAlarm();
    setShowCompletionPopup(false);
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
            Start Focus
          </button>

        ) : (

          <button
            className="start-button"
            onClick={pause}
          >
            Pause
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

      {showCompletionPopup && (
        <div className="completion-overlay">
          <div className="completion-popup">

            <div className="completion-icon">
              ✓
            </div>

            <h2>Task Completed!</h2>

            <p>
              Great job! You completed your focus session.
            </p>

            <strong>
              {selectedTask?.title}
            </strong>

            <button
              className="completion-ok"
              onClick={handleCompletionOK}
            >
              OK
            </button>

          </div>
        </div>
      )}

    </section>
  );
}

export default Timer;