import { useState, useEffect } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "https://port-0-vibe-backend-mp2qjekld96f6b11.sel3.cloudtype.app/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo }),
      });
      if (response.ok) {
        const data = await response.json();
        setTodos([data, ...todos]); // Prepend since get is sorted desc
        setNewTodo("");
      }
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(todo => ((todo._id || todo.id) === id ? updatedTodo : todo)));
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo._id || todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(todo => ((todo._id || todo.id) === id ? updatedTodo : todo)));
        setEditingId(null);
        setEditTitle("");
      }
    } catch (error) {
      console.error("Failed to save edit:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTodos(todos.filter(todo => (todo._id || todo.id) !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="todo-card">
        <h1 className="title">
          <span className="title-gradient">Task Master</span>
        </h1>
        <p className="subtitle">Manage your daily tasks with elegance</p>

        <form className="add-todo-form" onSubmit={addTodo}>
          <input
            type="text"
            className="todo-input"
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button type="submit" className="add-button">
            Add Task
          </button>
        </form>

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-state">No tasks yet. Enjoy your day!</div>
          ) : (
            todos.map(todo => {
              const todoId = todo._id || todo.id;
              return (
                <div
                  key={todoId}
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                >
                  <div className="todo-content">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todoId, todo.completed)}
                      />
                      <span className="checkmark"></span>
                    </label>

                    {editingId === todoId ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(todoId)}
                        autoFocus
                      />
                    ) : (
                      <span className="todo-text">{todo.title}</span>
                    )}
                  </div>

                  <div className="todo-actions">
                    {editingId === todoId ? (
                      <>
                        <button onClick={() => saveEdit(todoId)} className="action-btn save-btn">
                          Save
                        </button>
                        <button onClick={cancelEdit} className="action-btn cancel-btn">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(todo)} className="action-btn edit-btn">
                          Edit
                        </button>
                        <button onClick={() => deleteTodo(todoId)} className="action-btn delete-btn">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
