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

  function handleAuth(authUser) {
    setUser(authUser);
  }

  return (
    <div style={styles.app}>
      {user && (
        <nav style={styles.nav}>
          <span style={styles.brand}>🔥 CalTrack</span>

          <div style={styles.right}>
            <div style={styles.links}>
              <NavLink to="/" end
                style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}>
                Dashboard
              </NavLink>
              <NavLink to="/history"
                style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}>
                History
              </NavLink>
            </div>

            <button style={styles.userBtn} onClick={() => setShowPanel(true)}>
              👤 {user.name}
            </button>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </nav>
      )}

      <main style={styles.main}>
        <Routes>
          <Route path="/login" element={
            user
              ? <Navigate to="/" replace />
              : <LoginPage onAuth={handleAuth} />
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
          onSaved={(updated) => {
            handleUserUpdate(updated);
            setShowPanel(false);
          }}
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
  app: { minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' },
  nav: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 24px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  brand: { fontWeight: 800, fontSize: 18 },
  right:  { display: 'flex', alignItems: 'center', gap: 8 },
  links:  { display: 'flex', gap: 4 },
  link: {
    padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
    color: '#6b7280', fontWeight: 500, fontSize: 14, transition: 'background 0.15s',
  },
  activeLink: { background: '#eff6ff', color: '#3b82f6' },
  userBtn: {
    padding: '6px 14px', borderRadius: 20, border: 'none',
    background: '#f3f4f6', fontWeight: 500, fontSize: 14,
    cursor: 'pointer', marginLeft: 8,
  },
  logoutBtn: {
    padding: '6px 14px', borderRadius: 20, border: '1px solid #e5e7eb',
    background: '#fff', fontWeight: 500, fontSize: 14,
    color: '#6b7280', cursor: 'pointer',
  },
  main: { paddingTop: 8 },
};
