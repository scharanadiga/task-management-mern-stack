import { Link } from 'react-router-dom';

const STATUS_LABEL = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

export default function TaskCard({ task, onDelete, onMarkComplete }) {
  const isOverdue =
    task.dueDate &&
    task.status !== 'completed' &&
    new Date(task.dueDate) < new Date();

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : null;

  return (
    <div className={`task-card${task.status === 'completed' ? ' completed' : ''}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge badge-${task.priority}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className={`badge badge-${task.status}`}>
          {STATUS_LABEL[task.status]}
        </span>
        {formattedDate && (
          <span className={`due-date${isOverdue ? ' overdue' : ''}`}>
            Due: {formattedDate}{isOverdue ? ' (overdue)' : ''}
          </span>
        )}
      </div>

      <div className="task-actions">
        {task.status !== 'completed' && (
          <button
            className="btn btn-success btn-sm"
            onClick={() => onMarkComplete(task.id)}
          >
            Complete
          </button>
        )}
        <Link to={`/tasks/${task.id}/edit`} className="btn btn-ghost btn-sm">
          Edit
        </Link>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
