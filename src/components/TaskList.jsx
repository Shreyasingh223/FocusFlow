
import { useState } from "react";
import { Trash2, Plus, X } from "lucide-react";

const API_BASE_URL = "https://focusflow-backend-ktmp.onrender.com";

const formatTaskSchedule = (startAt, endAt) => {
  if (!startAt || !endAt) return null;

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return null;
  }

  const date = start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const startTime = start.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTime = end.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${date} • ${startTime} – ${endTime}`;
};

function TaskList({
  tasks,
  setTasks,
  selectedTask,
  setSelectedTask,
}) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    skill: "",
    deadline: "",
    estimatedDuration: 30,
    scheduledDate: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
  });
  const getToken = () => localStorage.getItem("focusflow-token");

  const getLocalStorageKey = () => {
    try {
      const savedUser = localStorage.getItem("focusflow-user");
      if (!savedUser) return null;

      const currentUser = JSON.parse(savedUser);

      return currentUser?.id
        ? `focusflow-tasks-${currentUser.id}`
        : null;
    } catch {
      return null;
    }
  };

  // Preserve legacy tasks that have not been migrated to MongoDB.
  const saveLegacyTasks = (updatedTasks) => {
    const key = getLocalStorageKey();
    if (!key) return;

    const legacyTasks = updatedTasks.filter(
      (task) => !/^[a-f\d]{24}$/i.test(String(task.id))
    );

    localStorage.setItem(key, JSON.stringify(legacyTasks));
  };

  // Add a task to MongoDB.
  const addTask = async (e) => {
    e.preventDefault();
    setError("");

    if (!newTask.title.trim()) {
      setError("Please enter a task title.");
      return;
    }


    // Validate scheduled date and time
    const {
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
    } = newTask;

    const hasAnySchedule =
      scheduledDate || scheduledStartTime || scheduledEndTime;

    if (hasAnySchedule) {
      if (
        !scheduledDate ||
        !scheduledStartTime ||
        !scheduledEndTime
      ) {
        setError(
          "Please enter the scheduled date, start time, and end time."
        );
        return;
      }

      const start = new Date(
        `${scheduledDate}T${scheduledStartTime}:00`
      );

      const end = new Date(
        `${scheduledDate}T${scheduledEndTime}:00`
      );

      if (end <= start) {
        setError(
          "Scheduled end time must be later than start time."
        );
        return;
      }
    }


    const token = getToken();

    if (!token) {
      setError("Please log in again to add tasks.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: newTask.title.trim(),
          priority: newTask.priority,
          skill: newTask.skill.trim() || "Other",
          deadline: newTask.deadline || "",
          estimatedDuration: Number(newTask.estimatedDuration),

          scheduledStartAt:
            newTask.scheduledDate &&
              newTask.scheduledStartTime
              ? new Date(
                `${newTask.scheduledDate}T${newTask.scheduledStartTime}:00`
              ).toISOString()
              : null,

          scheduledEndAt:
            newTask.scheduledDate &&
              newTask.scheduledEndTime
              ? new Date(
                `${newTask.scheduledDate}T${newTask.scheduledEndTime}:00`
              ).toISOString()
              : null,
        }),

      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create task.");
      }

      if (!data.task?.id) {
        throw new Error("The server returned an invalid task.");
      }

      setTasks((previousTasks) => [...previousTasks, data.task]);

      setNewTask({
        title: "",
        priority: "Medium",
        skill: "",
        deadline: "",
        estimatedDuration: 30,
        scheduledDate: "",
        scheduledStartTime: "",
        scheduledEndTime: "",
      });

      setShowForm(false);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  // Complete or uncomplete a task.
  const toggleTask = async (id) => {
    setError("");

    const existingTask = tasks.find((task) => task.id === id);
    if (!existingTask) return;

    const completingTask = !existingTask.completed;
    const completedAt = completingTask
      ? new Date().toISOString()
      : null;

    const isDatabaseTask = /^[a-f\d]{24}$/i.test(String(id));

    // Handle older local tasks without sending their IDs to MongoDB.
    if (!isDatabaseTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === id
          ? {
            ...task,
            completed: completingTask,
            completedAt,
          }
          : task
      );

      setTasks(updatedTasks);
      saveLegacyTasks(updatedTasks);
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please log in again to update tasks.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: completingTask,
          completedAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update task.");
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === id ? data.task : task
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update task.");
    }
  };

  // Delete a task from MongoDB or remove a legacy local task.
  const deleteTask = async (id) => {
    setError("");

    const isDatabaseTask = /^[a-f\d]{24}$/i.test(String(id));

    if (isDatabaseTask) {
      const token = getToken();

      if (!token) {
        setError("Please log in again to delete tasks.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/tasks/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not delete task.");
        }
      } catch (err) {
        setError(err.message || "Unable to delete task.");
        return;
      }
    }

    const updatedTasks = tasks.filter((task) => task.id !== id);

    setTasks(updatedTasks);
    saveLegacyTasks(updatedTasks);

    if (selectedTask === id) {
      setSelectedTask(null);
    }
  };

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <section className="tasks-section">
      <div className="section-header">
        <div>
          <h2>Today's Tasks</h2>
          <p>
            {completedTasks} of {tasks.length} completed
          </p>
        </div>

        <button
          type="button"
          className="add-task"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          <Plus size={16} />
          Add task
        </button>
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <form className="task-form" onSubmit={addTask}>
          <div className="form-header">
            <h3>Add a new task</h3>

            <button
              type="button"
              className="close-form"
              onClick={() => setShowForm(false)}
              disabled={saving}
              aria-label="Close task form"
            >
              <X size={18} />
            </button>
          </div>

          <input
            type="text"
            placeholder="What do you need to do?"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                title: e.target.value,
              })
            }
            autoFocus
          />

          <input
            type="text"
            placeholder="Skill / Subject (e.g. React, DBMS, Python)"
            value={newTask.skill}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                skill: e.target.value,
              })
            }
          />

          <label className="task-date-label">Deadline</label>

          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                deadline: e.target.value,
              })
            }
          />


          <label className="task-date-label">
            Scheduled date
          </label>

          <input
            type="date"
            value={newTask.scheduledDate}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                scheduledDate: e.target.value,
              })
            }
          />

          <label className="task-date-label">
            Scheduled start time
          </label>

          <input
            type="time"
            value={newTask.scheduledStartTime}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                scheduledStartTime: e.target.value,
              })
            }
          />

          <label className="task-date-label">
            Scheduled end time
          </label>

          <input
            type="time"
            value={newTask.scheduledEndTime}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                scheduledEndTime: e.target.value,
              })
            }
          />


          <label className="task-date-label">
            Estimated time (minutes)
          </label>

          <input
            type="number"
            min="1"
            max="1440"
            placeholder="e.g. 30"
            value={newTask.estimatedDuration}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                estimatedDuration: e.target.value,
              })
            }
          />

          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                priority: e.target.value,
              })
            }
          >
            <option value="High">High priority</option>
            <option value="Medium">Medium priority</option>
            <option value="Low">Low priority</option>
          </select>

          <button
            type="submit"
            className="save-task"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Task"}
          </button>
        </form>
      )}

      <div className="tasks">
        {tasks.map((task) => (
          <div
            className={
              task.completed
                ? "task completed"
                : selectedTask === task.id
                  ? "task selected-task"
                  : "task"
            }
            key={task.id}
          >
            <button
              type="button"
              className="checkbox"
              onClick={() => toggleTask(task.id)}
              aria-label={
                task.completed
                  ? "Mark task incomplete"
                  : "Complete task"
              }
            >
              {task.completed && "✓"}
            </button>

            <div className="task-info">
              <span className="task-title">{task.title}</span>

              <span
                className={`priority ${(
                  task.priority || "Medium"
                ).toLowerCase()}`}
              >
                {task.priority || "Medium"}
              </span>

              {task.scheduledStartAt && task.scheduledEndAt && (
                <span className="task-schedule">
                  <span>🗓️</span>{" "}
                  {formatTaskSchedule(
                    task.scheduledStartAt,
                    task.scheduledEndAt
                  )}
                </span>
              )}

              {!task.completed && (
                <button
                  type="button"
                  className="focus-task"
                  onClick={() => setSelectedTask(task.id)}
                >
                  Focus
                </button>
              )}
            </div>

            <button
              type="button"
              className="delete-task"
              onClick={() => deleteTask(task.id)}
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TaskList;
