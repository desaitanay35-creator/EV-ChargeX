import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import './AppLayout.css';

/**
 * Shared shell for every authenticated page: sidebar navigation on the
 * left, scrollable content area on the right. Individual pages render
 * their own <Header title="..." subtitle="..." /> so each page controls
 * its own heading copy, exactly like the original design.
 */
export default function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-content">
        <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
      </main>
    </div>
  );
}
