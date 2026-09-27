import { Moon, Sun, Clock3, Flame, LogOut } from "lucide-react";
import { useState } from "react";


function Settings({
  user,
  darkMode,
  setDarkMode,
  handleLogout,
}) {
  const [settings, setSettings] = useState(() => {
    if (!user) {
      return {
        emailNotifications: true,
        dailyReminder: true,
        soundEffects: true,
        autoStartBreak: false,
      };
    }

    const savedSettings = localStorage.getItem(
      `focusflow-settings-${user.id}`
    );

    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          emailNotifications: true,
          dailyReminder: true,
          soundEffects: true,
          autoStartBreak: false,
        };
  });

  const updateSetting = (key, value) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(updatedSettings);

    if (!user) return;

    localStorage.setItem(
      `focusflow-settings-${user.id}`,
      JSON.stringify(updatedSettings)
    );
  };

  return (
    <div className="settings-page">

      {/* Header */}
      <div className="settings-header">
        <div>
          <p className="eyebrow">SETTINGS</p>

          <h1>Make FocusFlow yours.</h1>

          <p>
            Manage your profile, preferences and
            productivity experience.
          </p>
        </div>
      </div>


      {/* Profile */}
      <div className="settings-section">

        <div className="settings-section-heading">
          <div>
            <h2>Profile</h2>
            <p>Your FocusFlow account information.</p>
          </div>
        </div>

        <div className="profile-settings-card">

          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="profile-settings-info">
            <h3>{user?.name || "User"}</h3>
            <p>{user?.email || "No email available"}</p>
          </div>

          <div className="profile-status">
            <span></span>
            Active account
          </div>

        </div>

      </div>


      {/* Appearance */}
      <div className="settings-section">

        <div className="settings-section-heading">
          <div>
            <h2>Appearance</h2>
            <p>Customize how FocusFlow looks.</p>
          </div>
        </div>

        <div className="settings-option-card">

          <div className="settings-option-info">

            <div className="settings-option-icon">
              {darkMode ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </div>

            <div>
              <strong>Dark mode</strong>

              <p>
                Use a darker interface that's easier
                on your eyes.
              </p>
            </div>

          </div>

          <button
            className={`settings-toggle ${
              darkMode ? "on" : ""
            }`}
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            <span></span>
          </button>

        </div>

      </div>


      {/* Notifications */}
      <div className="settings-section">

        <div className="settings-section-heading">
          <div>
            <h2>Notifications</h2>
            <p>Control your productivity reminders.</p>
          </div>
        </div>

        <div className="settings-options-list">

          {/* Email notifications */}
          <div className="settings-option-card">

            <div className="settings-option-info">

              <div className="settings-option-icon">
                <span className="settings-at-icon">
                  @
                </span>
              </div>

              <div>
                <strong>Email notifications</strong>

                <p>
                  Receive important account and
                  productivity updates.
                </p>
              </div>

            </div>

            <button
              className={`settings-toggle ${
                settings.emailNotifications
                  ? "on"
                  : ""
              }`}
              onClick={() =>
                updateSetting(
                  "emailNotifications",
                  !settings.emailNotifications
                )
              }
            >
              <span></span>
            </button>

          </div>


          {/* Daily reminder */}
          <div className="settings-option-card">

            <div className="settings-option-info">

              <div className="settings-option-icon">
                <Clock3 size={19} />
              </div>

              <div>
                <strong>Daily reminder</strong>

                <p>
                  Get a reminder to stay consistent
                  with your tasks.
                </p>
              </div>

            </div>

            <button
              className={`settings-toggle ${
                settings.dailyReminder
                  ? "on"
                  : ""
              }`}
              onClick={() =>
                updateSetting(
                  "dailyReminder",
                  !settings.dailyReminder
                )
              }
            >
              <span></span>
            </button>

          </div>

        </div>

      </div>


      {/* Productivity */}
      <div className="settings-section">

        <div className="settings-section-heading">
          <div>
            <h2>Productivity</h2>
            <p>Customize your focus experience.</p>
          </div>
        </div>

        <div className="settings-options-list">

          {/* Sound effects */}
          <div className="settings-option-card">

            <div className="settings-option-info">

              <div className="settings-option-icon">
                <Flame size={19} />
              </div>

              <div>
                <strong>Sound effects</strong>

                <p>
                  Play sounds when focus sessions
                  finish.
                </p>
              </div>

            </div>

            <button
              className={`settings-toggle ${
                settings.soundEffects
                  ? "on"
                  : ""
              }`}
              onClick={() =>
                updateSetting(
                  "soundEffects",
                  !settings.soundEffects
                )
              }
            >
              <span></span>
            </button>

          </div>


          {/* Auto-start breaks */}
          <div className="settings-option-card">

            <div className="settings-option-info">

              <div className="settings-option-icon">
                <Clock3 size={19} />
              </div>

              <div>
                <strong>Auto-start breaks</strong>

                <p>
                  Automatically begin your break after
                  a focus session.
                </p>
              </div>

            </div>

            <button
              className={`settings-toggle ${
                settings.autoStartBreak
                  ? "on"
                  : ""
              }`}
              onClick={() =>
                updateSetting(
                  "autoStartBreak",
                  !settings.autoStartBreak
                )
              }
            >
              <span></span>
            </button>

          </div>

        </div>

      </div>


      {/* Account */}
      <div className="settings-section">

        <div className="settings-section-heading">
          <div>
            <h2>Account</h2>
            <p>Manage your FocusFlow session.</p>
          </div>
        </div>

        <div className="settings-danger-card">

          <div>
            <strong>Log out of FocusFlow</strong>

            <p>
              You'll be returned to the landing page.
            </p>
          </div>

          <button
            className="settings-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Log out
          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;