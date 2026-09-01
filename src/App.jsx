import TaskList from "./components/TaskList";
import Timer from "./components/Timer";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Flame,
  Clock3,
  ListTodo,
  Menu,
  X,
} from "lucide-react";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("focusflow-tasks");

    return savedTasks
      ? JSON.parse(savedTasks)
      : [
        {
          id: 1,
          title: "Finish React project",
          priority: "High",
          completed: false,
        },
        {
          id: 2,
          title: "Practice JavaScript",
          priority: "Medium",
          completed: false,
        },
        {
          id: 3,
          title: "Update GitHub README",
          priority: "Low",
          completed: true,
        },
        {
          id: 4,
          title: "Read React documentation",
          priority: "Medium",
          completed: true,
        },
      ];
  });

  useEffect(() => {
    localStorage.setItem(
      "focusflow-tasks",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  // Sessions
  const [sessions, setSessions] = useState(() => {
    const savedSessions =
      localStorage.getItem("focusflow-sessions");

    return savedSessions
      ? JSON.parse(savedSessions)
      : [];
  });


  // Save sessions
  useEffect(() => {
    localStorage.setItem(
      "focusflow-sessions",
      JSON.stringify(sessions)
    );
  }, [sessions]);

  const completeSession = useCallback((duration) => {
    if (!selectedTask) return;

    const task = tasks.find(
      (task) => task.id === selectedTask
    );

    if (!task) return;

    const newSession = {
      id: Date.now(),
      taskId: task.id,
      taskTitle: task.title,
      duration: 25,
      completedAt: new Date().toISOString(),
    };

    setSessions((previousSessions) => [
      ...previousSessions,
      newSession,
    ]);
  }, [selectedTask, tasks]);

  const clearHistory = () => {
    setSessions([]);
  };

  //find selected tasks
  const currentTask = tasks.find(
    (task) => task.id === selectedTask
  );

  // Dynamic Dashboard Statistics
  const tasksRemaining = tasks.filter(
    (task) => !task.completed
  ).length;

  const focusTime = sessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  const focusHours = Math.floor(focusTime / 60);
  const focusMinutes = focusTime % 60;

  const formattedFocusTime =
    focusHours > 0
      ? `${focusHours}h ${focusMinutes}m`
      : `${focusMinutes}m`;

  // Calculate current daily streak
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;

    const completedDates = [
      ...new Set(
        sessions.map((session) =>
          new Date(session.completedAt).toLocaleDateString()
        )
      ),
    ];

    const today = new Date();
    let streak = 0;

    for (let i = 0; ; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateString = date.toLocaleDateString();

      if (completedDates.includes(dateString)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Dynamic date and greeting
  const now = new Date();

  const currentHour = now.getHours();

  let greeting;

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={darkMode ? "app dark" : "app"}>

      {/* Sidebar */}
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>

        <div className="logo">
          <div className="logo-icon">F</div>
          <span>FocusFlow</span>

          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          <a className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </a>

          <a className="nav-item">
            <CheckSquare size={20} />
            <span>Tasks</span>
          </a>

          <a className="nav-item">
            <BarChart3 size={20} />
            <span>Analytics</span>
          </a>

          <a className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-box">
            <Flame size={22} />

            <div>
              <strong>
                {currentStreak} day streak
              </strong>

              <span>
                {currentStreak > 0
                  ? "Keep going!"
                  : "Start your streak today!"}
              </span>
            </div>
          </div>
        </div>
      </aside>


      {/* Main */}
      <main className="main">

        <header className="header">

          <button
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="header-actions">

            <button
              className="icon-button"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="avatar">
              S
            </div>

          </div>
        </header>


        <section className="content">

          {/* Welcome */}
          <div className="welcome">

            <p className="eyebrow">
              {formattedDate.toUpperCase()}
            </p>

            <h1>
              {greeting}, Shreya 👋
            </h1>

            <p className="subtitle">
              Let's make today a productive one.
            </p>

          </div>


          {/* Statistics */}
          <div className="stats">

            <StatCard
              icon={<ListTodo />}
              number={tasksRemaining}
              label="Tasks remaining"
            />

            <StatCard
              icon={<Clock3 />}
              number={formattedFocusTime}
              label="Focus time"
            />

            <StatCard
              icon={<Flame />}
              number={currentStreak}
              label="Day streak"
            />

          </div>


          {/* Timer */}
          <Timer
            selectedTask={currentTask}
            completeSession={completeSession}
          />


          {/* Tasks */}
          <TaskList
            tasks={tasks}
            setTasks={setTasks}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
          />
          <SessionHistory
            sessions={sessions}
            clearHistory={clearHistory}
          />

        </section>

      </main>

    </div>
  );
}


function StatCard({ icon, number, label }) {

  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <strong>{number}</strong>
        <span>{label}</span>
      </div>

    </div>
  );
}


function Task({ title, priority, completed }) {

  return (
    <div className={completed ? "task completed" : "task"}>

      <button className="checkbox">
        {completed && "✓"}
      </button>

      <div className="task-info">

        <span className="task-title">
          {title}
        </span>

        <span className={`priority ${priority.toLowerCase()}`}>
          {priority}
        </span>

      </div>

    </div>
  );
}

function SessionHistory({ sessions, clearHistory }) {

  return (
    <section className="session-history">

      <div className="section-header">

        <div>
          <h2>Focus History</h2>

          <p>
            {sessions.length} completed session
            {sessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {sessions.length > 0 && (
          <button
            className="clear-history"
            onClick={clearHistory}
          >
            Clear history
          </button>
        )}

      </div>


      {sessions.length === 0 ? (

        <div className="empty-history">

          <p>
            No completed sessions yet.
          </p>

          <small>
            Complete a focus session and it will appear here.
          </small>
        </div>

      ) : (

        <div className="session-list">

          {sessions
            .slice()
            .reverse()
            .map((session) => (

              <div
                className="session-item"
                key={session.id}
              >

                <div className="session-icon">
                  🍅
                </div>

                <div className="session-info">

                  <strong>
                    {session.taskTitle}
                  </strong>

                  <span>
                    {session.duration} min focus session
                  </span>

                </div>

                <span className="session-time">
                  {new Date(
                    session.completedAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

              </div>

            ))}

        </div>

      )}

    </section>
  );
}

export default App;