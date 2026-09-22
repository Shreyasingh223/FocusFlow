import {
  CheckCircle2,
  Clock3,
  CalendarDays,
  FolderOpen,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import "./LandingPage.css";

function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="landing-page">

      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="landing-logo">
          <span className="logo-star">✦</span>
          FocusFlow
        </div>

        <div className="landing-nav-links">
            
          <a href="#features">Features</a>
          <a href="#about">About</a>

          <button className="landing-login-btn" onClick={onLogin}>
            Login
          </button>

          <button className="landing-signup-btn" onClick={onGetStarted}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">

        <div className="hero-content">

          <div className="hero-badge">
            <Sparkles size={16} />
            Built for students, made for focus
          </div>

          <h1>
            Plan better.
            <br />
            <span>Focus deeper.</span>
            <br />
            Get things done.
          </h1>

          <p>
            FocusFlow is your personal productivity workspace for managing
            tasks, staying focused, planning your study schedule and keeping
            everything you need in one place.
          </p>

          <div className="hero-buttons">
            <button className="hero-primary-btn" onClick={onGetStarted}>
              Get Started
              <ArrowRight size={19} />
            </button>

            <button className="hero-secondary-btn" onClick={onLogin}>
              I already have an account
            </button>
          </div>

          <div className="hero-note">
            <CheckCircle2 size={16} />
            Simple • Student-friendly • Focused
          </div>

        </div>

        {/* Dashboard Preview */}
        <div className="hero-preview">

          <div className="preview-window">

            <div className="preview-topbar">
              <div className="preview-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="preview-title">
                FocusFlow
              </div>
            </div>

            <div className="preview-body">

              <div className="preview-sidebar">
                <div className="preview-brand">✦</div>

                <div className="preview-side-line active"></div>
                <div className="preview-side-line"></div>
                <div className="preview-side-line"></div>
                <div className="preview-side-line"></div>
                <div className="preview-side-line"></div>
              </div>

              <div className="preview-dashboard">

                <div className="preview-greeting">
                  <small>YOUR PRODUCTIVITY SPACE</small>
                  <h3>Good morning 👋</h3>
                  <p>Ready to make some progress today?</p>
                </div>

                <div className="preview-stats">

                  <div className="preview-stat">
                    <Clock3 size={17} />
                    <div>
                      <strong>2h 40m</strong>
                      <span>Focus time</span>
                    </div>
                  </div>

                  <div className="preview-stat">
                    <CheckCircle2 size={17} />
                    <div>
                      <strong>8</strong>
                      <span>Tasks done</span>
                    </div>
                  </div>

                </div>

                <div className="preview-task-box">
                  <div className="preview-task-header">
                    <strong>Today's Tasks</strong>
                    <span>3 remaining</span>
                  </div>

                  <div className="preview-task">
                    <CheckCircle2 size={16} />
                    <span>Complete React project</span>
                  </div>

                  <div className="preview-task">
                    <CheckCircle2 size={16} />
                    <span>Practice JavaScript</span>
                  </div>

                  <div className="preview-task">
                    <div className="task-circle"></div>
                    <span>Prepare DBMS notes</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">

        <div className="section-heading">
          <span>WHY FOCUSFLOW?</span>
          <h2>Everything you need to stay on track.</h2>
          <p>
            One simple workspace for your everyday student life.
          </p>
        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon">
              <CheckCircle2 />
            </div>
            <h3>Smart Tasks</h3>
            <p>
              Organize assignments, projects and everyday tasks with
              priorities and completion tracking.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Clock3 />
            </div>
            <h3>Focus Sessions</h3>
            <p>
              Use Pomodoro-based focus sessions to study with less
              distraction and better time management.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <CalendarDays />
            </div>
            <h3>Calendar</h3>
            <p>
              Keep track of exams, assignments, deadlines and important
              academic dates.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FolderOpen />
            </div>
            <h3>Resources</h3>
            <p>
              Keep important notes, timetables, date sheets and assignments
              organized in one place.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <BarChart3 />
            </div>
            <h3>Analytics</h3>
            <p>
              Understand your focus sessions and productivity through useful
              statistics.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles />
            </div>
            <h3>AI Assistance</h3>
            <p>
              Get help breaking down tasks and creating personalized study
              plans.
            </p>
          </div>

        </div>
      </section>

      {/* About */}
      <section className="landing-about" id="about">

        <div>
          <span>MADE FOR STUDENTS</span>

          <h2>
            Your studies.
            <br />
            Your goals.
            <br />
            One flow.
          </h2>
        </div>

        <div className="about-text">
          <p>
            Students often have assignments, exams, projects, deadlines and
            study material scattered across different apps.
          </p>

          <p>
            FocusFlow brings those everyday productivity needs together in
            one simple workspace.
          </p>

          <button onClick={onGetStarted}>
            Start using FocusFlow
            <ArrowRight size={18} />
          </button>
        </div>

      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <span className="logo-star">✦</span>
          FocusFlow
        </div>

        <p>
          Plan better. Focus deeper. Get things done.
        </p>

        <span>
          © {new Date().getFullYear()} FocusFlow
        </span>
      </footer>

    </div>
  );
}

export default LandingPage;