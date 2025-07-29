"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  Home,
  Users,
  MessageSquare,
  Calendar,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  BarChart3,
  Briefcase,
} from "lucide-react";
import "../../styles/dashboard.scss";
import "../../styles/sidebar.scss";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Connections", href: "/dashboard/connections" },
    { icon: Search, label: "Explore", href: "/dashboard/explore" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: Calendar, label: "Calls", href: "/dashboard/calls" },
    { icon: Briefcase, label: "Jobs", href: "/dashboard/jobs" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: BarChart3, label: "Insights", href: "/dashboard/insights" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  // Get user data from session
  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "Student";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle click outside to close mobile sidebar
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".sidebar") && !target.closest(".mobile-menu-btn")) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Simple Icon Sidebar */}
      <div className={`sidebar icon-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">CC</h2>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="nav-item icon-nav-item"
                title={item.label}
              >
                <Icon size={24} />
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn icon-logout-btn"
            title="Logout"
            onClick={() => signOut({ callbackUrl: "/auth" })}
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="user-info">
            <div className="avatar">
              <span>{userInitials}</span>
            </div>
            <div className="user-details">
              <span className="name">{userName}</span>
              <span className="role">{userRole}</span>
            </div>
          </div>
          <div className="top-bar-right">
            {/* Space for future actions on the right */}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
