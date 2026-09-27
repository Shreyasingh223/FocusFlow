import { useState } from "react";
import { Trash2, Plus, X } from "lucide-react";

function TaskList({
  tasks,
  setTasks,
  selectedTask,
  setSelectedTask,
}) {

  const [showForm, setShowForm] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    skill: "",
    deadline: "",
  });

  // Add a new task
  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.title.trim(),
      priority: newTask.priority,
      skill: newTask.skill.trim() || "Other",
      createdAt: new Date().toISOString(),
      deadline: newTask.deadline || "",
      completed: false,
      completedAt: null,
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      task,
    ]);

    setNewTask({
      title: "",
      priority: "Medium",
      skill: "",
      deadline: "",
    });

    setShowForm(false);
  };

  // Complete / uncomplete task
  const toggleTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        const completingTask = !task.completed;

        return {
          ...task,
          completed: completingTask,
          completedAt: completingTask
            ? new Date().toISOString()
            : null,
        };
      })
    );
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );

    if (selectedTask === id) {
      setSelectedTask(null);
    }
  };

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <section className="tasks-section">

      {/* Header */}

      <div className="section-header">

        <div>
          <h2>Today's Tasks</h2>

          <p>
            {completedTasks} of {tasks.length} completed
          </p>
        </div>

        <button
          className="add-task"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          Add task
        </button>

      </div>


      {/* Add Task Form */}

      {showForm && (
        <form
          className="task-form"
          onSubmit={addTask}
        >

          <div className="form-header">

            <h3>Add a new task</h3>

            <button
              type="button"
              className="close-form"
              onClick={() => setShowForm(false)}
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

          <label className="task-date-label">
            Deadline
          </label>

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
          >
            Add Task
          </button>

        </form>
      )}


      {/* Tasks */}

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
            >
              {task.completed && "✓"}
            </button>


            <div className="task-info">

              <span className="task-title">
                {task.title}
              </span>

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