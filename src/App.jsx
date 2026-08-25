import Timer from "./components/Timer";

import { useState } from "react";
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
              <strong>7 day streak</strong>
              <span>Keep going!</span>
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
              TUESDAY, AUGUST 25
            </p>

            <h1>
              Good afternoon, Shreya 👋
            </h1>

            <p className="subtitle">
              Let's make today a productive one.
            </p>

          </div>


          {/* Statistics */}
          <div className="stats">

            <StatCard
              icon={<ListTodo />}
              number="4"
              label="Tasks remaining"
            />

            <StatCard
              icon={<Clock3 />}
              number="2h 40m"
              label="Focus time"
            />

            <StatCard
              icon={<Flame />}
              number="7"
              label="Day streak"
            />

          </div>


          {/* Timer */}
          <Timer />


          {/* Tasks */}
          <section className="tasks-section">

            <div className="section-header">

              <div>
                <h2>Today's Tasks</h2>

                <p>
                  2 of 5 completed
                </p>
              </div>

              <button className="add-task">
                + Add task
              </button>

            </div>


            <div className="tasks">

              <Task
                title="Finish React project"
                priority="High"
              />

              <Task
                title="Practice JavaScript"
                priority="Medium"
              />

              <Task
                title="Update GitHub README"
                priority="Low"
                completed
              />

              <Task
                title="Read React documentation"
                priority="Medium"
                completed
              />

            </div>

          </section>

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


export default App;