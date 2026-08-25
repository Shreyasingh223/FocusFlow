import { useState } from "react";
import { useTimer } from "../hooks/useTimer";

function Timer() {

  const [mode, setMode] = useState("focus");

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


  const changeMode = (newMode) => {
    setMode(newMode);
    reset(durations[newMode]);
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
          Session 1 of 4
        </span>

      </div>


      <div className="timer">

        <div className="timer-circle">

          <div className="timer-content">

            <span className="timer-mode">
              {isRunning ? "Focusing" : "Ready"}
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


        <button onClick={() => reset(durations[mode])}>
          Reset
        </button>

      </div>

    </section>
  );
}

export default Timer;