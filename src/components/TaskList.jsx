import { useEffect, useState } from "react";
import { Trash2, Plus, X } from "lucide-react";

function TaskList() {
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

  const [showForm, setShowForm] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
  });

  // Add a new task
  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.title,
      priority: newTask.priority,
      completed: false,
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      task,
    ]);

    setNewTask({
      title: "",
      priority: "Medium",
    });

    setShowForm(false);
  };

  // Complete / uncomplete task
  const toggleTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
            ...task,
            completed: !task.completed,
          }
          : task
      )
    );
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );
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