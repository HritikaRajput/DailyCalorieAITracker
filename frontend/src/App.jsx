import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ProfilePanel from './components/ProfilePanel';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('calorie_tracker_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showPanel, setShowPanel] = useState(false);

  function handleUserUpdate(updated) {
    localStorage.setItem('calorie_tracker_user', JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <BrowserRouter>
      <div style={styles.app}>
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

            {user && (
              <button style={styles.userBtn} onClick={() => setShowPanel(true)}>
                👤 {user.name}
              </button>
            )}
          </div>
        </nav>

        <main style={styles.main}>
          <Routes>
            <Route path="/"        element={<Dashboard user={user} onUserUpdate={handleUserUpdate} />} />
            <Route path="/history" element={<History />} />
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
  main: { paddingTop: 8 },
};
