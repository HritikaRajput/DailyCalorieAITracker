import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/client';

export default function LoginPage({ onAuth }) {
  const [tab, setTab]         = useState('signin');   // 'signin' | 'register'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (tab === 'signin') {
        data = await login({ email, password });
      } else {
        data = await register({ name, email, password });
      }
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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.brand}>🔥 CalTrack</h1>
        <p style={styles.tagline}>Your voice-powered calorie tracker</p>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'signin'   ? styles.tabActive : {}) }}
            onClick={() => { setTab('signin');   setError(''); }}
          >
            Sign In
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'register' ? styles.tabActive : {}) }}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {tab === 'register' && (
            <label style={styles.label}>
              Name
              <input
                style={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              placeholder={tab === 'register' ? 'Min 8 characters' : '••••••••'}
              required
              minLength={tab === 'register' ? 8 : undefined}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.submit} type="submit" disabled={loading}>
            {loading
              ? 'Please wait…'
              : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f9fafb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
  },
  brand: { margin: 0, fontSize: 28, fontWeight: 800, textAlign: 'center' },
  tagline: { margin: '4px 0 24px', color: '#6b7280', fontSize: 14, textAlign: 'center' },
  tabs: {
    display: 'flex',
    background: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    fontWeight: 500,
    fontSize: 14,
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: '#fff',
    color: '#1f2937',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500, color: '#374151' },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  error: {
    margin: 0,
    padding: '10px 12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#dc2626',
    fontSize: 13,
  },
  submit: {
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 4,
  },
};
