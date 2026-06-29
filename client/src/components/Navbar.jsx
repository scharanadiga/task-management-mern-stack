import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/tasks" className="navbar-brand">Task Manager</Link>
      <div className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.name}</span>
            <Link to="/tasks/new" className="btn btn-primary btn-sm">+ New Task</Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
