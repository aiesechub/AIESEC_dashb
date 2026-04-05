// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import AdminApp from './admin/AdminApp';
import GlobalVolunteer from './components/GlobalVolunteer';
import GlobalTalent from './components/GlobalTalent';
import GlobalTeacher from './components/GlobalTeacher';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ── Public website ── */}
        <Route path="/" element={<App />} />
        <Route path="/global-volunteer" element={<GlobalVolunteer />} />
        <Route path="/global-talent"    element={<GlobalTalent />} />
        <Route path="/global-teacher"   element={<GlobalTeacher />} />

        {/* ── Admin dashboard — protected by Supabase auth inside AdminApp ── */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* ── 404 fallback ── */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);