import LandingPage from "./components/LandingPage";
import TaskList from "./components/TaskList";
import Timer from "./components/Timer";
import Calendar from "./components/Calendar";
import Resources from "./components/Resources";

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
  CalendarDays,
  FolderOpen,
} from "lucide-react";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("landing");
  const [activePage, setActivePage] = useState("overview");

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

  // Analytics
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const productivityRate =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const totalFocusSessions = sessions.length;

  const totalFocusMinutes = sessions.reduce(
    (total, session) => total + session.duration,
    0
  );

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


  if (currentPage === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setCurrentPage("signup")}
        onLogin={() => setCurrentPage("login")}
      />
    );
  }
  return (


    <div className={darkMode ? "app dark" : "app"}>

      {/* Sidebar */}
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>

        <div className="logo">
          <div className="logo-icon">✦</div>
          <span>FocusFlow</span>

          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          <button
            className={`nav-item ${activePage === "overview" ? "active" : ""
              }`}
            onClick={() => {
              setActivePage("overview");
              setSidebarOpen(false);
            }}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </button>

          <a className="nav-item">
            <CheckSquare size={20} />
            <span>Tasks</span>
          </a>

          <button
            className={`nav-item ${activePage === "analytics" ? "active" : ""
              }`}
            onClick={() => {
              setActivePage("analytics");
              setSidebarOpen(false);
            }}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>

          <button
            className={`nav-item ${activePage === "calendar" ? "active" : ""
              }`}
            onClick={() => {
              setActivePage("calendar");
              setSidebarOpen(false);
            }}
          >
            <CalendarDays size={20} />
            <span>Calendar</span>
          </button>

          <button
            className={`nav-item ${activePage === "resources" ? "active" : ""
              }`}
            onClick={() => {
              setActivePage("resources");
              setSidebarOpen(false);
            }}
          >
            <FolderOpen size={20} />
            <span>Resources</span>
          </button>

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
            <Menu
              size={22}
              color={darkMode ? "white" : "currentColor"}
            />
          </button>

          <div className="header-actions">

            <button
              className="icon-button"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={20} color="orange" /> : <Moon size={20} />}
            </button>

            <div className="avatar">
              S
            </div>

          </div>
        </header>

        <section className="content">

          {activePage === "overview" && (
            <>
              {/* Welcome */}
              <div className="welcome">

                <p className="eyebrow">
                  {formattedDate.toUpperCase()}
                </p>

                <h1>
                  {greeting}, Shreya
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

              {/* Session History */}
              <SessionHistory
                sessions={sessions}
                clearHistory={clearHistory}
              />
            </>
          )}


          {activePage === "analytics" && (
            <Analytics
              sessions={sessions}
              tasks={tasks}
              completedTasks={completedTasks}
              totalTasks={totalTasks}
              productivityRate={productivityRate}
            />
          )}

          {activePage === "calendar" && (
            <Calendar />
          )}

          {activePage === "resources" && (
            <Resources />
          )}

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

function getLastSevenDays(sessions) {
  const days = [];

  for (let i = 6; i >= 0; i--) {

    const date = new Date();

    date.setDate(date.getDate() - i);

    const dateKey = date.toLocaleDateString();

    const daySessions = sessions.filter(
      (session) =>
        new Date(
          session.completedAt
        ).toLocaleDateString() === dateKey
    );

    days.push({
      date: dateKey,

      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),

      sessions: daySessions.length,
    });
  }

  return days;
}

function Analytics({
  sessions,
  tasks,
  completedTasks,
  totalTasks,
  productivityRate,
}) {
  const totalFocusMinutes = sessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusMinutes = totalFocusMinutes % 60;

  const formatFocusTime = () => {
    if (focusHours > 0) {
      return `${focusHours}h ${focusMinutes}m`;
    }

    return `${focusMinutes}m`;
  };

  return (
    <div className="analytics-page">

      {/* Page Header */}
      <div className="analytics-header">

        <div>
          <p className="eyebrow">
            PRODUCTIVITY INSIGHTS
          </p>

          <h1>
            Your Analytics
          </h1>

          <p>
            Track your progress and understand your
            productivity patterns.
          </p>
        </div>

      </div>


      {/* Main Statistics */}
      <div className="analytics-stats">

        <div className="analytics-card">

          <div className="analytics-card-top">
            <span>Focus Sessions</span>
            <div className="analytics-icon">
              🍅
            </div>
          </div>

          <strong>
            {sessions.length}
          </strong>

          <p>
            completed sessions
          </p>

        </div>


        <div className="analytics-card">

          <div className="analytics-card-top">
            <span>Focus Time</span>
            <div className="analytics-icon">
              ⏱️
            </div>
          </div>

          <strong>
            {formatFocusTime()}
          </strong>

          <p>
            total focused time
          </p>

        </div>


        <div className="analytics-card">

          <div className="analytics-card-top">
            <span>Tasks Completed</span>
            <div className="analytics-icon">
              ✅
            </div>
          </div>

          <strong>
            {completedTasks}
          </strong>

          <p>
            out of {totalTasks} tasks
          </p>

        </div>


        <div className="analytics-card">

          <div className="analytics-card-top">
            <span>Productivity</span>
            <div className="analytics-icon">
              📈
            </div>
          </div>

          <strong>
            {productivityRate}%
          </strong>

          <p>
            task completion rate
          </p>

        </div>

      </div>


      {/* Weekly Activity */}
      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>
            <h2>Focus Activity</h2>

            <p>
              Your recent focus sessions
            </p>
          </div>

          <span className="analytics-badge">
            Last 7 days
          </span>

        </div>


        <div className="activity-chart">

          {getLastSevenDays(sessions).map((day) => (

            <div
              className="activity-day"
              key={day.date}
            >

              <div className="activity-bar-container">

                <div
                  className="activity-bar"
                  style={{
                    height: `${Math.max(
                      day.sessions * 35,
                      day.sessions > 0 ? 35 : 8
                    )}px`,
                  }}
                >
                  {day.sessions > 0 && (
                    <span>
                      {day.sessions}
                    </span>
                  )}
                </div>

              </div>

              <span className="activity-label">
                {day.label}
              </span>

            </div>

          ))}

        </div>

      </div>


      {/* Productivity Summary */}
      <div className="analytics-summary">

        <div className="summary-content">

          <span className="summary-icon">
            🎯
          </span>

          <div>
            <h3>
              Keep building your momentum
            </h3>

            <p>
              You have completed {completedTasks} of{" "}
              {totalTasks} tasks and finished{" "}
              {sessions.length} focus sessions.
            </p>
          </div>

        </div>

        <div className="summary-percentage">
          {productivityRate}%
        </div>

      </div>

    </div>
  );
}

export default App;