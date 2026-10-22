
import { useState } from "react";
import { Trash2, Plus, X } from "lucide-react";

const API_BASE_URL = "https://focusflow-backend-ktmp.onrender.com";

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
  });

  const getToken = () => localStorage.getItem("focusflow-token");

  const getLocalStorageKey = () => {
    const savedUser = localStorage.getItem("focusflow-user");
    if (!savedUser) return null;

    try {
      const currentUser = JSON.parse(savedUser);
      return currentUser?.id
        ? `focusflow-tasks-${currentUser.id}`
        : null;
    } catch {
      return null;
    }
  };

  // Keep legacy local tasks saved until they are migrated safely.
  const saveLegacyTasks = (updatedTasks) => {
    const key = getLocalStorageKey();
    if (!key) return;

    const legacyTasks = updatedTasks.filter(
      (task) => !/^[a-f\d]{24}$/i.test(String(task.id))
    );

    localStorage.setItem(key, JSON.stringify(legacyTasks));
  };

  const addTask = async (e) => {
    e.preventDefault();
    setError("");

    if (!newTask.title.trim()) {
      setError("Please enter a task title.");
      return;
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create task.");
      }

      setTasks((previousTasks) => [...previousTasks, data.task]);

      setNewTask({
        title: "",
        priority: "Medium",
        skill: "",
        deadline: "",
      });

      setShowForm(false);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (id) => {
    setError("");

    const existingTask = tasks.find((task) => task.id === id);
    if (!existingTask) return;

    const completingTask = !existingTask.completed;
    const completedAt = completingTask ? new Date().toISOString() : null;

    // Legacy tasks have numeric IDs and are not in MongoDB yet.
    const isDatabaseTask = /^[a-f\d]{24}$/i.test(String(id));

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
              setNewTask({ ...newTask, title: e.target.value })
            }
            autoFocus
          />

          <input
            type="text"
            placeholder="Skill / Subject (e.g. React, DBMS, Python)"
            value={newTask.skill}
            onChange={(e) =>
              setNewTask({ ...newTask, skill: e.target.value })
            }
          />

          <label className="task-date-label">Deadline</label>

          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask({ ...newTask, deadline: e.target.value })
            }
          />

          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask({ ...newTask, priority: e.target.value })
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
              className="checkbox"
              onClick={() => toggleTask(task.id)}
              aria-label={
                task.completed ? "Mark task incomplete" : "Complete task"
              }
            >
              {task.completed && "✓"}
            </button>

            <div className="task-info">
              <span className="task-title">{task.title}</span>

              <span
                className={`priority ${task.priority.toLowerCase()}`}
              >
                {task.priority}
              </span>

              {!task.completed && (
                <button
                  className="focus-task"
                  onClick={() => setSelectedTask(task.id)}
                >
                  Focus
                </button>
              )}
            </div>

            <button
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
