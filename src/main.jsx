import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminUnlockPage from './pages/AdminUnlockPage';
import './index.css';

// 註冊 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.log('SW registration failed:', err));
  });
}

// 根據 hash 決定顯示主 App 或後台頁面
const isAdmin = window.location.hash === '#/admin';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? <AdminUnlockPage /> : <App />}
  </React.StrictMode>
);
