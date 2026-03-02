import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import LoginPage from './pages/Login';
import ProfilePanel from './components/ProfilePanel';

function ProtectedRoute({ user, children }) {
  if (!user || !localStorage.getItem('auth_token')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Avatar({ name }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  return (
    <div style={styles.avatar} title={name}>
      {initials}
    </div>
  );
}

function AppShell({ user, setUser }) {
  const [showPanel, setShowPanel] = useState(false);
  const navigate = useNavigate();

  function handleUserUpdate(updated) {
    localStorage.setItem('calorie_tracker_user', JSON.stringify(updated));
    setUser(updated);
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('calorie_tracker_user');
    setUser(null);
    navigate('/login', { replace: true });
  }

  return (
    <div style={styles.app}>
      {user && (
        <nav style={styles.nav}>
          <span style={styles.brand}>🔥 CalTrack</span>

          <div style={styles.navLinks}>
            <NavLink to="/" end style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}>
              Dashboard
            </NavLink>
            <NavLink to="/history" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}>
              History
            </NavLink>
          </div>

          <div style={styles.navRight}>
            <button style={styles.avatarBtn} onClick={() => setShowPanel(true)} title="Edit profile">
              <Avatar name={user.name} />
              <span style={styles.avatarName}>{user.name.split(' ')[0]}</span>
            </button>
            <button style={styles.signOutBtn} className="btn-hover" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </nav>
      )}

      <main>
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <LoginPage onAuth={(u) => setUser(u)} />
          } />
          <Route path="/" element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} onUserUpdate={handleUserUpdate} />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute user={user}>
              <History />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {showPanel && user && (
        <ProfilePanel
          user={user}
          onClose={() => setShowPanel(false)}
          onSaved={(updated) => { handleUserUpdate(updated); setShowPanel(false); }}
        />
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('auth_token');
    const saved = localStorage.getItem('calorie_tracker_user');
    return token && saved ? JSON.parse(saved) : null;
  });

  return (
    <BrowserRouter>
      <AppShell user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

const styles = {
  app: { minHeight: '100vh', background: '#F7F7F7' },
  nav: {
    background: '#fff',
    borderBottom: '1px solid #EBEBEB',
    height: 64,
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 0 #EBEBEB',
  },
  brand: {
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: '-0.5px',
    color: '#1A1A1A',
  },
  navLinks: { display: 'flex', gap: 4 },
  link: {
    padding: '8px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    color: '#717171',
    fontWeight: 500,
    fontSize: 14,
    transition: 'all 0.15s',
  },
  activeLink: {
    color: '#1A1A1A',
    fontWeight: 600,
    background: '#F7F7F7',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: '1px solid #EBEBEB',
    borderRadius: 24,
    padding: '4px 12px 4px 4px',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#1A1A1A',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarName: { fontSize: 14, fontWeight: 600, color: '#1A1A1A' },
  signOutBtn: {
    background: 'none',
    border: 'none',
    fontSize: 14,
    color: '#717171',
    cursor: 'pointer',
    fontWeight: 500,
    padding: '8px 4px',
    transition: 'color 0.15s',
  },
};
