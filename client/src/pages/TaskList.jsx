import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getTasks, updateTask, deleteTask } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import Pagination from '../components/Pagination';
import useDebounce from '../hooks/useDebounce';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

export default function TaskList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const status = searchParams.get('status') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Sync debounced search into URL
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) next.set('search', debouncedSearch);
      else next.delete('search');
      next.set('page', '1');
      return next;
    }, { replace: true });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10, sortBy, order };
      if (status) params.status = status;
      const search = searchParams.get('search');
      if (search) params.search = search;

      const data = await getTasks(params);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const setParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.set('page', '1');
      return next;
    }, { replace: true });
  };

  const handleMarkComplete = async (id) => {
    try {
      await updateTask(id, { status: 'completed' });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t)));
    } catch {
      alert('Failed to update task.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
    } catch {
      alert('Failed to delete task.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Tasks</h1>
        <Link to="/tasks/new" className="btn btn-primary">+ New Task</Link>
      </div>

      <div className="filters">
        <div className="form-group search-group">
          <label className="form-label">Search</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search by title…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Sort By</label>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setParam('sortBy', e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Order</label>
          <select
            className="form-select"
            value={order}
            onChange={(e) => setParam('order', e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {(status || searchParams.get('search')) && (
          <div className="filters-right">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSearchInput('');
                setSearchParams({}, { replace: true });
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">No tasks found</p>
          <p className="empty-state-desc">
            {searchParams.get('search') || status
              ? 'Try adjusting your filters.'
              : 'Create your first task to get started.'}
          </p>
          <Link to="/tasks/new" className="btn btn-primary">+ New Task</Link>
        </div>
      ) : (
        <>
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMarkComplete={handleMarkComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChange={(p) => setParam('page', String(p))}
          />
        </>
      )}
    </div>
  );
}
