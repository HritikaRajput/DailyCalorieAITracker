import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/client';

export default function LoginPage({ onAuth }) {
  const [tab, setTab]       = useState('signin');
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const navigate            = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = tab === 'signin'
        ? await login({ email, password })
        : await register({ name, email, password });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('calorie_tracker_user', JSON.stringify(data.user));
      onAuth(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t) { setTab(t); setError(''); }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brandRow}>
          <span style={styles.brandIcon}>🔥</span>
          <span style={styles.brandName}>CalTrack</span>
        </div>
        <h1 style={styles.heading}>
          {tab === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={styles.subheading}>
          {tab === 'signin'
            ? 'Sign in to track your nutrition.'
            : 'Start tracking calories with your voice.'}
        </p>

        {/* Tab switcher */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'signin'   ? styles.tabActive : {}) }}
            onClick={() => switchTab('signin')}
          >Sign in</button>
          <button
            style={{ ...styles.tab, ...(tab === 'register' ? styles.tabActive : {}) }}
            onClick={() => switchTab('register')}
          >Create account</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {tab === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Full name</label>
              <input
                style={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              placeholder={tab === 'register' ? 'At least 8 characters' : '••••••••'}
              required
              minLength={tab === 'register' ? 8 : undefined}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠</span> {error}
            </div>
          )}

          <button style={styles.submitBtn} type="submit" disabled={loading} className="btn-hover">
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              tab === 'signin' ? 'Continue' : 'Create account'
            )}
          </button>
        </form>

        <p style={styles.switchHint}>
          {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button style={styles.switchLink} onClick={() => switchTab(tab === 'signin' ? 'register' : 'signin')}>
            {tab === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F7F7F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
    padding: '40px 40px 32px',
    width: '100%',
    maxWidth: 420,
    animation: 'fadeUp 0.3s ease',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 },
  brandIcon: { fontSize: 28 },
  brandName: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#1A1A1A' },
  heading: { margin: '0 0 6px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', color: '#1A1A1A' },
  subheading: { margin: '0 0 24px', fontSize: 14, color: '#717171', lineHeight: 1.5 },
  tabs: {
    display: 'flex',
    background: '#F7F7F7',
    borderRadius: 10,
    padding: 4,
    marginBottom: 28,
    gap: 4,
  },
  tab: {
    flex: 1,
    padding: '9px 0',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    fontWeight: 500,
    fontSize: 14,
    color: '#717171',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: '#fff',
    color: '#1A1A1A',
    fontWeight: 600,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#1A1A1A' },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #EBEBEB',
    fontSize: 15,
    color: '#1A1A1A',
    background: '#fff',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: '#FFF5F5',
    border: '1px solid #FECACA',
    borderRadius: 10,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: 500,
  },
  errorIcon: { fontSize: 14, flexShrink: 0 },
  submitBtn: {
    padding: '14px',
    borderRadius: 10,
    border: 'none',
    background: '#1A1A1A',
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    transition: 'opacity 0.15s',
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  switchHint: {
    margin: '20px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: '#717171',
  },
  switchLink: {
    background: 'none',
    border: 'none',
    color: '#1A1A1A',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 13,
    padding: 0,
    textDecoration: 'underline',
  },
};
