
import React, { useEffect, useState } from 'react';
import { api } from '../api';

function Header({ onLogout, email }) {
  return (
    <nav className="navbar navbar-light bg-white mb-4" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
      <div className="container-fluid">
        <div className="d-flex align-items-center gap-3">
          <span className="navbar-brand">Scalable App With Dashboard</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={onLogout}>
            Logout
          </button>

          <div className="d-flex align-items-center gap-2">
            <a className="text-muted">Profile</a>
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36 }}
            >
              {email ? email.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


function StatCard({ label, value }) {
  return (
    <div className="stat-card p-3">
      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted">{label}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function TaskCard({ t, onEdit, onDelete, onChangeStatus }) {
  return (
    <div className="task-card mb-3">
      <div className="d-flex justify-content-between">
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{t.title}</div>
          <div className="text-muted" style={{ fontSize: 13 }}>
            {t.description || ''}
          </div>
          <div className="mt-2 d-flex gap-2">
            <span className="badge bg-light text-dark badge-pill">{t.status}</span>
            <span className="badge bg-light text-dark badge-pill">{t.priority}</span>
          </div>
          <div className="text-muted mt-3" style={{ fontSize: 13 }}>
            {t.created}
          </div>
        </div>
        <div className="d-flex flex-column align-items-end">
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" type="button">
              •••
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={() => onEdit(t)}>
                  Edit
                </button>
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => onDelete(t.id)}>
                  Delete
                </button>
              </li>
            </ul>
          </div>

          <div className="mt-3">
            <button className="btn btn-sm btn-outline-primary" onClick={() => onChangeStatus(t.id)}>
              Change Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [editTask, setEditTask] = useState(null);

  const token = localStorage.getItem('tf_token');
  const email = localStorage.getItem('tf_email');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const data = await api('/api/tasks', { token });
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (err && err.status === 401) {
        localStorage.removeItem('tf_token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }

  async function add() {
    if (!title.trim()) return;
    await api('/api/tasks', { method: 'POST', token, body: { title, description, priority: 'Medium', status: 'Pending' } });
    setTitle('');
    setDescription('');
    await fetchTasks();
    const modalEl = document.getElementById('addModal');
    if (modalEl && window.bootstrap) new window.bootstrap.Modal(modalEl).hide();
  }

  async function remove(id) {
    if (!window.confirm('Delete this task?')) return;
    await api('/api/tasks/' + id, { method: 'DELETE', token });
    await fetchTasks();
  }

  async function changeStatus(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const next = t.status === 'Pending' ? 'In Progress' : t.status === 'In Progress' ? 'Completed' : 'Pending';
    await api('/api/tasks/' + id, { method: 'PUT', token, body: { status: next } });
    await fetchTasks();
  }

  async function saveEdit(task) {
    if (!task || !task.title.trim()) return;
    await api('/api/tasks/' + task.id, { method: 'PUT', token, body: task });
    setEditTask(null);
    await fetchTasks();
    const modalEl = document.getElementById('editModal');
    if (modalEl && window.bootstrap) new window.bootstrap.Modal(modalEl).hide();
  }

  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (
      search &&
      !(
        (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
  };

  function logout() {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_email');
    window.location.href = '/login';
  }

  return (
    <div>
      <Header onLogout={logout} email={email} />
      <div className="container">
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <StatCard label="Total Tasks" value={stats.total} />
          </div>
          <div className="col-md-3">
            <StatCard label="Pending" value={stats.pending} />
          </div>
          <div className="col-md-3">
            <StatCard label="In Progress" value={stats.inProgress} />
          </div>
          <div className="col-md-3">
            <StatCard label="Completed" value={stats.completed} />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Tasks</h5>
          <div>
            <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
              + Add Task
            </button>
          </div>
        </div>

        <div className="filter-bar mb-3">
          <input className="form-control search-input" placeholder="Search tasks by title or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <select className="form-select" style={{ width: 160 }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-muted">No tasks</div>
        ) : (
          filtered.map((t) => (
            <TaskCard
              key={t.id}
              t={t}
              onEdit={(task) => {
                setEditTask(task);
                // open bootstrap modal after state set
                setTimeout(() => {
                  const modalEl = document.getElementById('editModal');
                  if (modalEl && window.bootstrap) new window.bootstrap.Modal(modalEl).show();
                }, 50);
              }}
              onDelete={remove}
              onChangeStatus={changeStatus}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      <div className="modal fade" id="addModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Add Task</h6>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <input className="form-control mb-2" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className="form-control mb-2" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
              <select className="form-select mb-2" defaultValue="Medium">
                <option>Medium</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-primary" onClick={add}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <div className="modal fade" id="editModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Edit Task</h6>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              {editTask ? (
                <>
                  <input className="form-control mb-2" value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} />
                  <textarea className="form-control mb-2" value={editTask.description || ''} onChange={(e) => setEditTask({ ...editTask, description: e.target.value })} />
                  <select className="form-select mb-2" value={editTask.priority} onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <select className="form-select" value={editTask.status} onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </>
              ) : (
                <div>Select a task to edit</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (editTask) saveEdit(editTask);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}