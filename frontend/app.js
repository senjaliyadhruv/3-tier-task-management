// App.js - React Frontend
import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks. Make sure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Create or update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/tasks/${editingId}` : `${API_URL}/tasks`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
        setEditingId(null);
        fetchTasks();
        fetchStats();
        setError('');
      }
    } catch (err) {
      setError('Failed to save task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTasks();
        fetchStats();
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  // Edit task
  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority
    });
    setEditingId(task._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📋 Task Manager</h1>
        <p>A Simple 3-Tier Application for DevOps Testing</p>
      </header>

      {/* Statistics Dashboard */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Tasks</p>
        </div>
        <div className="stat-card pending">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card in-progress">
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card completed">
          <h3>{stats.completed}</h3>
          <p>Completed</p>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Task Form */}
      <div className="form-container">
        <h2>{editingId ? '✏️ Edit Task' : '➕ Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Task Title *"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          
          <textarea
            name="description"
            placeholder="Task Description (optional)"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />

          <div className="form-row">
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select name="priority" value={formData.priority} onChange={handleInputChange}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Task' : 'Add Task'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tasks List */}
      <div className="tasks-container">
        <h2>📝 Tasks List</h2>
        {loading && !tasks.length ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Create your first task above!</p>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div key={task._id} className={`task-card ${task.status} ${task.priority}`}>
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority}
                  </span>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-footer">
                  <span className={`status-badge ${task.status}`}>
                    {task.status}
                  </span>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(task)} className="edit-btn">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="delete-btn">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
