// src/layout/MainLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/layout/Topbar";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import "@/styles/mobile-nav.css";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* SIDEBAR - Desktop only */}
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

      {/* ÁREA PRINCIPAL */}
      <div className="layout-main">
        <Topbar />
        {/* Tabs agora estão integradas no Topbar */}
        <main
          className="layout-content"
          style={{ paddingTop: "8px", paddingBottom: "80px" }}
        >
          <Outlet />
        </main>
      </div>

      {/* OVERLAY MOBILE - Sidebar */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* MOBILE BOTTOM NAV */}
      <MobileBottomNav />
    </div>
  );
}
