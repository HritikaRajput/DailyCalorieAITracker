import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F7F7F7; color: #1A1A1A; }
  input, select, button, textarea { font-family: inherit; }
  input:focus, select:focus { outline: none; box-shadow: 0 0 0 3px rgba(0,0,0,0.12); border-color: #1A1A1A !important; }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
  @keyframes recording-ring {
    0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.35); }
    70% { box-shadow: 0 0 0 18px rgba(220,38,38,0); }
    100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .card-hover:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; transform: translateY(-1px); }
  .btn-hover:hover { opacity: 0.85; }
  ::placeholder { color: #B0B0B0; }
`;
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
