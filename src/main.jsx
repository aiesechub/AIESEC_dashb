// src/main.jsx
// Wire up the admin dashboard at /admin using React Router.
//
// Install React Router first:
//   npm install react-router-dom
// ----------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';           // Your existing public site
import AdminApp from './admin/AdminApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public website */}
        <Route path="/" element={<App />} />

        {/* Admin dashboard — protected by Supabase auth inside AdminApp */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* 404 fallback */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);