import axios from 'axios';

// In production (Vercel), VITE_API_URL is set to the Railway backend URL.
// In local dev, it's empty and Vite proxy forwards /api → localhost:3001.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000, // 60s — voice processing can take a moment
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const register = (data) =>
  client.post('/api/v1/auth/register', data).then((r) => r.data);

export const login = (data) =>
  client.post('/api/v1/auth/login', data).then((r) => r.data);

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = () => client.get('/api/v1/users').then((r) => r.data.users);

export const createUser = (data) =>
  client.post('/api/v1/users', data).then((r) => r.data.user);

export const updateUser = (id, data) =>
  client.put(`/api/v1/users/${id}`, data).then((r) => r.data.user);

// ── Meals ─────────────────────────────────────────────────────────────────────

export const getMeals = (userId, date) =>
  client.get('/api/v1/meals', { params: { userId, date } }).then((r) => r.data);

export const getMealsSummary = (userId, days = 7) =>
  client.get('/api/v1/meals/summary', { params: { userId, days } }).then((r) => r.data);

export const recordMeal = (audioBlob, userId, mealType, date) => {
  const form = new FormData();
  form.append('audio', audioBlob, `recording.webm`);
  form.append('userId', userId);
  form.append('mealType', mealType);
  if (date) form.append('date', date);
  return client.post('/api/v1/meals/record', form).then((r) => r.data);
};

export const updateMeal = (id, data) =>
  client.put(`/api/v1/meals/${id}`, data).then((r) => r.data.meal);

export const deleteMeal = (id) =>
  client.delete(`/api/v1/meals/${id}`).then((r) => r.data);
