import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <nav style={styles.nav}>
          <span style={styles.brand}>🔥 CalTrack</span>
          <div style={styles.links}>
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/history"
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
            >
              History
            </NavLink>
          </div>
        </nav>
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
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
  links: { display: 'flex', gap: 8 },
  link: {
    padding: '6px 14px',
    borderRadius: 8,
    textDecoration: 'none',
    color: '#6b7280',
    fontWeight: 500,
    fontSize: 14,
    transition: 'background 0.15s',
  },
  activeLink: { background: '#eff6ff', color: '#3b82f6' },
  main: { paddingTop: 8 },
};
