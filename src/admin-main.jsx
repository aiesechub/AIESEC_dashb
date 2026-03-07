// src/admin-main.jsx
// Separate entry point for the admin dashboard.
// Boots on its own port via: npm run dev:admin
// This file mounts AdminApp into #admin-root (defined in admin.html).

import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './admin/AdminApp';
import './index.css'; // reuse your existing Tailwind / global styles

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);