import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createTask, getTask, updateTask } from '../services/taskService';

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  dueDate: '',
};

export default function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    getTask(id)
      .then((task) => {
        setForm({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        });
      })
      .catch(() => setApiError('Failed to load task.'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 200) e.title = 'Title cannot exceed 200 characters';
    if (form.description.length > 2000) e.description = 'Description cannot exceed 2000 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      ...(form.dueDate && { dueDate: form.dueDate }),
    };

    try {
      if (isEdit) {
        await updateTask(id, payload);
      } else {
        await createTask(payload);
      }
      navigate('/tasks');
    } catch (err) {
      const msg = err.response?.data?.error?.message;
      const details = err.response?.data?.error?.details;
      if (details?.length) {
        const fieldErrs = {};
        details.forEach((d) => { fieldErrs[d.field] = d.message; });
        setErrors(fieldErrs);
      } else {
        setApiError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <h1 className="form-page-title">{isEdit ? 'Edit Task' : 'New Task'}</h1>
      </div>

      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            className={`form-input${errors.title ? ' error' : ''}`}
            value={form.title}
            onChange={handleChange}
            placeholder="Task title"
            maxLength={200}
          />
          {errors.title ? (
            <span className="form-error">{errors.title}</span>
          ) : (
            <span className="form-hint">{form.title.length}/200</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className={`form-textarea${errors.description ? ' error' : ''}`}
            value={form.description}
            onChange={handleChange}
            placeholder="Optional description…"
            maxLength={2000}
            rows={4}
          />
          {errors.description ? (
            <span className="form-error">{errors.description}</span>
          ) : (
            <span className="form-hint">{form.description.length}/2000</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              className="form-select"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className={`form-input${errors.dueDate ? ' error' : ''}`}
            value={form.dueDate}
            onChange={handleChange}
          />
          {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
          <Link to="/tasks" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
