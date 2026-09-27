import LandingPage from "./components/LandingPage";
import Signup from "./components/Signup";
import Login from "./components/Login";
import TaskList from "./components/TaskList";
import Timer from "./components/Timer";
import Calendar from "./components/Calendar";
import Resources from "./components/Resources";
import SettingsPage from "./components/Settings";

import { useCallback, useEffect, useRef, useState } from "react";
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
  LogOut,
} from "lucide-react";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const token = localStorage.getItem("focusflow-token");
    const user = localStorage.getItem("focusflow-user");

    if (token && user) {
      return "dashboard";
    }

    return "landing";
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("focusflow-user");

    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activePage, setActivePage] = useState("overview");

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskDetails, setSelectedTaskDetails] =
    useState(null);

  const [taskFilter, setTaskFilter] = useState("all");

  const handleLogout = () => {
    localStorage.removeItem("focusflow-token");
    localStorage.removeItem("focusflow-user");

    setUser(null);
    setActivePage("overview");
    setSidebarOpen(false);
    setCurrentPage("landing");

    setSelectedTask(null);
    setSelectedTaskDetails(null);
  };

  // ===============================
  // TASKS
  // ===============================

  const [tasks, setTasks] = useState([]);

  const isLoadingTasks = useRef(false);

  // Load tasks whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const storageKey = `focusflow-tasks-${user.id}`;
    const savedTasks = localStorage.getItem(storageKey);

    isLoadingTasks.current = true;

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
      return;
    }

    const defaultTasks = [
      {
        id: 1,
        title: "Finish React project",
        priority: "High",
        skill: "React",
        createdAt: new Date().toISOString(),
        deadline: "",
        completed: false,
        completedAt: null,
      },
      {
        id: 2,
        title: "Practice JavaScript",
        priority: "Medium",
        skill: "JavaScript",
        createdAt: new Date().toISOString(),
        deadline: "",
        completed: false,
        completedAt: null,
      },
      {
        id: 3,
        title: "Update GitHub README",
        priority: "Low",
        skill: "GitHub",
        createdAt: new Date().toISOString(),
        deadline: "",
        completed: false,
        completedAt: null,
      },
    ];

    setTasks(defaultTasks);

    localStorage.setItem(
      storageKey,
      JSON.stringify(defaultTasks)
    );
  }, [user]);

  // Save tasks only after they have been loaded
  useEffect(() => {
    if (!user) return;

    // Skip the save caused by loading a user's tasks
    if (isLoadingTasks.current) {
      isLoadingTasks.current = false;
      return;
    }

    localStorage.setItem(
      `focusflow-tasks-${user.id}`,
      JSON.stringify(tasks)
    );
  }, [tasks, user]);

  // ===============================
  // SESSIONS
  // ===============================

  const [sessions, setSessions] = useState([]);

  const isLoadingSessions = useRef(false);

  // Load sessions whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }

    const storageKey = `focusflow-sessions-${user.id}`;
    const savedSessions = localStorage.getItem(storageKey);

    isLoadingSessions.current = true;

    setSessions(
      savedSessions
        ? JSON.parse(savedSessions)
        : []
    );
  }, [user]);

  // Save sessions only after they have been loaded
  useEffect(() => {
    if (!user) return;

    // Skip the save caused by loading a user's sessions
    if (isLoadingSessions.current) {
      isLoadingSessions.current = false;
      return;
    }

    localStorage.setItem(
      `focusflow-sessions-${user.id}`,
      JSON.stringify(sessions)
    );
  }, [sessions, user]);

  const completeSession = useCallback(
    (duration) => {
      if (!selectedTask) return;

      const task = tasks.find(
        (task) => task.id === selectedTask
      );

      if (!task) return;

      const newSession = {
        id: Date.now(),
        taskId: task.id,
        taskTitle: task.title,
        duration: duration,
        completedAt: new Date().toISOString(),
      };

      setSessions((previousSessions) => [
        ...previousSessions,
        newSession,
      ]);
    },
    [selectedTask, tasks]
  );

  const clearHistory = () => {
    setSessions([]);
  };

  // Save sessions for the logged-in user
  useEffect(() => {
    if (!user) return;

    localStorage.setItem(
      `focusflow-sessions-${user.id}`,
      JSON.stringify(sessions)
    );
  }, [sessions, user]);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }

    const savedSessions = localStorage.getItem(
      `focusflow-sessions-${user.id}`
    );

    setSessions(
      savedSessions ? JSON.parse(savedSessions) : []
    );
  }, [user]);

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
  // ===============================
  // TASK INTELLIGENCE
  // ===============================

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  );

  const completedTaskList = tasks.filter(
    (task) => task.completed
  );

  const overdueTasks = tasks.filter((task) => {
    if (!task.deadline || task.completed) {
      return false;
    }

    const deadline = new Date(task.deadline);
    deadline.setHours(23, 59, 59, 999);

    return deadline < new Date();
  });

  const taskCompletionRate =
    totalTasks > 0
      ? Math.round(
        (completedTaskList.length / totalTasks) * 100
      )
      : 0;

  const getDeadlineStatus = (task) => {
    if (!task.completed || !task.deadline) {
      return null;
    }

    if (!task.completedAt) {
      return "on-time";
    }

    const completedDate = new Date(task.completedAt);
    const deadlineDate = new Date(task.deadline);

    completedDate.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    if (completedDate < deadlineDate) {
      return "early";
    }

    if (completedDate > deadlineDate) {
      return "late";
    }

    return "on-time";
  };

  const getDaysDifference = (task) => {
    if (
      !task.completed ||
      !task.deadline ||
      !task.completedAt
    ) {
      return null;
    }

    const completedDate = new Date(task.completedAt);
    const deadlineDate = new Date(task.deadline);

    completedDate.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    return Math.round(
      (deadlineDate - completedDate) /
      (1000 * 60 * 60 * 24)
    );
  };

  const earlyTasks = completedTaskList.filter(
    (task) => getDeadlineStatus(task) === "early"
  );

  const onTimeTasks = completedTaskList.filter(
    (task) => getDeadlineStatus(task) === "on-time"
  );

  const lateTasks = completedTaskList.filter(
    (task) => getDeadlineStatus(task) === "late"
  );

  const skillStats = {};

  tasks.forEach((task) => {
    const skill = task.skill || "Other";

    if (!skillStats[skill]) {
      skillStats[skill] = {
        total: 0,
        completed: 0,
        focusMinutes: 0,
      };
    }

    skillStats[skill].total += 1;

    if (task.completed) {
      skillStats[skill].completed += 1;
    }

    const taskSessions = sessions.filter(
      (session) => session.taskId === task.id
    );

    skillStats[skill].focusMinutes +=
      taskSessions.reduce(
        (total, session) => total + session.duration,
        0
      );
  });

  const skillList = Object.entries(skillStats);

  const filteredTaskIntelligence = tasks.filter((task) => {
    if (taskFilter === "completed") {
      return task.completed;
    }

    if (taskFilter === "pending") {
      return !task.completed;
    }

    if (taskFilter === "overdue") {
      return overdueTasks.some(
        (item) => item.id === task.id
      );
    }

    if (taskFilter === "early") {
      return getDeadlineStatus(task) === "early";
    }

    if (taskFilter === "late") {
      return getDeadlineStatus(task) === "late";
    }

    return true;
  });

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

  if (currentPage === "signup") {
    return (
      <Signup
        onSignup={(userData) => {
          setUser(userData);
          setActivePage("overview");
          setSidebarOpen(false);
          setCurrentPage("dashboard");
        }}
        onLogin={() => setCurrentPage("login")}
        onBack={() => setCurrentPage("landing")}
      />
    );
  }

  if (currentPage === "login") {
    return (
      <Login
        onLogin={(userData) => {
          setUser(userData);
          setActivePage("overview");
          setSidebarOpen(false);
          setCurrentPage("dashboard");
        }}
        onSignup={() => setCurrentPage("signup")}
        onBack={() => setCurrentPage("landing")}
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

          <button
            className={`nav-item ${activePage === "tasks" ? "active" : ""}`}
            onClick={() => {
              setActivePage("tasks");
              setSidebarOpen(false);
            }}
          >
            <CheckSquare size={20} />
            <span>Tasks</span>
          </button>

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

          <button
            className={`nav-item ${activePage === "settings" ? "active" : ""
              }`}
            onClick={() => {
              setActivePage("settings");
              setSidebarOpen(false);
            }}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>

          <button
            className={`nav-item ${activePage === "logout" ? "active" : ""
              }`}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
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
              {user?.name?.charAt(0).toUpperCase() || "U"}
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
                  {greeting}, {user?.name || "there"} 👋
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

          {activePage === "tasks" && (
            <div className="task-intelligence-page">

              <div className="task-intelligence-header">
                <div>
                  <p className="eyebrow">
                    TASK INTELLIGENCE
                  </p>

                  <h1>
                    My Task Performance
                  </h1>

                  <p>
                    Understand how you plan, complete and manage
                    your work.
                  </p>
                </div>
              </div>


              {/* Statistics */}

              <div className="task-intelligence-stats">

                <div className="task-insight-card">
                  <span>Total Tasks</span>
                  <strong>{totalTasks}</strong>
                  <small>all tasks</small>
                </div>

                <div className="task-insight-card">
                  <span>Completed</span>
                  <strong>{completedTasks}</strong>
                  <small>finished</small>
                </div>

                <div className="task-insight-card">
                  <span>Pending</span>
                  <strong>{pendingTasks.length}</strong>
                  <small>remaining</small>
                </div>

                <div className="task-insight-card">
                  <span>Completion Rate</span>
                  <strong>{taskCompletionRate}%</strong>
                  <small>overall</small>
                </div>

                <div className="task-insight-card">
                  <span>Overdue</span>
                  <strong>{overdueTasks.length}</strong>
                  <small>past deadline</small>
                </div>

                <div className="task-insight-card">
                  <span>Skills</span>
                  <strong>{skillList.length}</strong>
                  <small>subjects</small>
                </div>

              </div>


              {/* Deadline + Skills */}

              <div className="task-intelligence-grid">

                <div className="task-intelligence-panel">

                  <div className="panel-heading">
                    <h2>Deadline Performance</h2>

                    <p>
                      See how your completion timing compares
                      with your deadlines.
                    </p>
                  </div>

                  <div className="deadline-performance">

                    <div className="deadline-item">
                      <span>Completed Early</span>
                      <strong>{earlyTasks.length}</strong>
                    </div>

                    <div className="deadline-item">
                      <span>On Time</span>
                      <strong>{onTimeTasks.length}</strong>
                    </div>

                    <div className="deadline-item">
                      <span>Completed Late</span>
                      <strong>{lateTasks.length}</strong>
                    </div>

                    <div className="deadline-item">
                      <span>Still Pending</span>
                      <strong>{pendingTasks.length}</strong>
                    </div>

                  </div>

                </div>


                <div className="task-intelligence-panel">

                  <div className="panel-heading">
                    <h2>Skills & Subjects</h2>

                    <p>
                      Your task distribution by skill.
                    </p>
                  </div>

                  <div className="skills-list">

                    {skillList.length === 0 ? (
                      <p className="empty-insight">
                        Add skills to your tasks to see them here.
                      </p>
                    ) : (
                      skillList.map(([skill, data]) => {

                        const percentage =
                          data.total > 0
                            ? Math.round(
                              (data.completed /
                                data.total) *
                              100
                            )
                            : 0;

                        return (
                          <div
                            className="skill-row"
                            key={skill}
                          >

                            <div>
                              <strong>{skill}</strong>

                              <span>
                                {data.completed} / {data.total}
                              </span>
                            </div>

                            <div className="skill-progress">

                              <div
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>
                        );
                      })
                    )}

                  </div>

                </div>

              </div>


              {/* Task History */}

              <div className="task-intelligence-panel">

                <div className="task-filter-header">

                  <div>
                    <h2>Task Performance</h2>

                    <p>
                      Click any task to see detailed performance.
                    </p>
                  </div>

                  <div className="task-filters">

                    {[
                      ["all", "All"],
                      ["pending", "Pending"],
                      ["completed", "Completed"],
                      ["early", "Early"],
                      ["late", "Late"],
                      ["overdue", "Overdue"],
                    ].map(([value, label]) => (

                      <button
                        key={value}
                        className={
                          taskFilter === value
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setTaskFilter(value)
                        }
                      >
                        {label}
                      </button>

                    ))}

                  </div>

                </div>


                <div className="intelligence-task-list">

                  {filteredTaskIntelligence.length === 0 ? (

                    <div className="empty-task-intelligence">

                      <h3>No tasks found</h3>

                      <p>
                        There are no tasks matching this filter.
                      </p>

                    </div>

                  ) : (

                    filteredTaskIntelligence.map((task) => {

                      const taskSessions =
                        sessions.filter(
                          (session) =>
                            session.taskId === task.id
                        );

                      const taskFocusMinutes =
                        taskSessions.reduce(
                          (total, session) =>
                            total + session.duration,
                          0
                        );

                      const status =
                        getDeadlineStatus(task);

                      const days =
                        getDaysDifference(task);

                      let performance = "Pending";

                      if (task.completed) {

                        if (status === "early") {
                          performance =
                            `${days} day${days === 1 ? "" : "s"
                            } early`;
                        } else if (status === "late") {
                          performance =
                            `${Math.abs(days)} day${Math.abs(days) === 1
                              ? ""
                              : "s"
                            } late`;
                        } else {
                          performance = "On time";
                        }

                      } else if (
                        task.deadline &&
                        new Date(task.deadline) < new Date()
                      ) {
                        performance = "Overdue";
                      }

                      return (

                        <div
                          className="intelligence-task-row"
                          key={task.id}
                          onClick={() =>
                            setSelectedTaskDetails(task)
                          }
                        >

                          <div className="intelligence-task-main">

                            <div
                              className={
                                task.completed
                                  ? "task-status-dot completed"
                                  : "task-status-dot"
                              }
                            />

                            <div>

                              <h3>
                                {task.title}
                              </h3>

                              <div className="task-meta">

                                <span>
                                  {task.skill || "Other"}
                                </span>

                                <span>
                                  {task.priority}
                                </span>

                              </div>

                            </div>

                          </div>


                          <div className="intelligence-task-info">

                            <div>
                              <small>Focus</small>

                              <strong>
                                {taskFocusMinutes >= 60
                                  ? `${Math.floor(
                                    taskFocusMinutes / 60
                                  )}h ${taskFocusMinutes % 60
                                  }m`
                                  : `${taskFocusMinutes}m`}
                              </strong>
                            </div>

                            <div>
                              <small>Deadline</small>

                              <strong>
                                {task.deadline
                                  ? new Date(
                                    task.deadline
                                  ).toLocaleDateString()
                                  : "Not set"}
                              </strong>
                            </div>

                            <div>
                              <small>Completed</small>

                              <strong>
                                {task.completedAt
                                  ? new Date(
                                    task.completedAt
                                  ).toLocaleDateString()
                                  : "—"}
                              </strong>
                            </div>

                            <div>
                              <small>Performance</small>

                              <strong>
                                {performance}
                              </strong>
                            </div>

                          </div>

                        </div>
                      );
                    })

                  )}

                </div>

              </div>


              {/* Task Details */}

              {selectedTaskDetails && (

                <div
                  className="task-details-overlay"
                  onClick={() =>
                    setSelectedTaskDetails(null)
                  }
                >

                  <div
                    className="task-details-modal"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <button
                      className="task-details-close"
                      onClick={() =>
                        setSelectedTaskDetails(null)
                      }
                    >
                      ×
                    </button>

                    <p className="eyebrow">
                      TASK DETAILS
                    </p>

                    <h2>
                      {selectedTaskDetails.title}
                    </h2>

                    <div className="task-detail-tags">

                      <span>
                        {selectedTaskDetails.priority}
                      </span>

                      <span>
                        {selectedTaskDetails.skill ||
                          "Other"}
                      </span>

                    </div>


                    <div className="task-detail-grid">

                      <div>
                        <small>Created</small>

                        <strong>
                          {selectedTaskDetails.createdAt
                            ? new Date(
                              selectedTaskDetails.createdAt
                            ).toLocaleDateString()
                            : "Not available"}
                        </strong>
                      </div>

                      <div>
                        <small>Deadline</small>

                        <strong>
                          {selectedTaskDetails.deadline
                            ? new Date(
                              selectedTaskDetails.deadline
                            ).toLocaleDateString()
                            : "Not set"}
                        </strong>
                      </div>

                      <div>
                        <small>Completed</small>

                        <strong>
                          {selectedTaskDetails.completedAt
                            ? new Date(
                              selectedTaskDetails.completedAt
                            ).toLocaleDateString()
                            : "Not completed"}
                        </strong>
                      </div>

                      <div>
                        <small>Performance</small>

                        <strong>
                          {getDeadlineStatus(
                            selectedTaskDetails
                          ) === "early"
                            ? `${getDaysDifference(
                              selectedTaskDetails
                            )} days early`
                            : getDeadlineStatus(
                              selectedTaskDetails
                            ) === "late"
                              ? `${Math.abs(
                                getDaysDifference(
                                  selectedTaskDetails
                                )
                              )} days late`
                              : selectedTaskDetails.completed
                                ? "Completed on time"
                                : "Still pending"}
                        </strong>
                      </div>

                    </div>


                    {(() => {

                      const taskSessions =
                        sessions.filter(
                          (session) =>
                            session.taskId ===
                            selectedTaskDetails.id
                        );

                      const taskFocusMinutes =
                        taskSessions.reduce(
                          (total, session) =>
                            total + session.duration,
                          0
                        );

                      return (

                        <div className="task-focus-summary">

                          <div>
                            <span>Focus Time</span>

                            <strong>
                              {taskFocusMinutes >= 60
                                ? `${Math.floor(
                                  taskFocusMinutes / 60
                                )}h ${taskFocusMinutes % 60
                                }m`
                                : `${taskFocusMinutes}m`}
                            </strong>
                          </div>

                          <div>
                            <span>Pomodoro Sessions</span>

                            <strong>
                              {taskSessions.length}
                            </strong>
                          </div>

                        </div>

                      );

                    })()}

                  </div>

                </div>

              )}

            </div>
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

          {activePage === "settings" && (
            <SettingsPage
              user={user}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              handleLogout={handleLogout}
            />
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