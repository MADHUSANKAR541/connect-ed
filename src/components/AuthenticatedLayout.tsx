'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
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
  Shield,
  User
} from 'lucide-react';
import '../styles/dashboard.scss';
import '../styles/sidebar.scss';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { data: session } = useSession();

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Connections', href: '/dashboard/connections' },
    { icon: Search, label: 'Explore', href: '/dashboard/explore' },
    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    { icon: Calendar, label: 'Calls', href: '/dashboard/calls' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: BarChart3, label: 'Insights', href: '/insights' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Shield, label: 'Admin', href: '/admin' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  // Get user data from session
  const userName = session?.user?.name || 'User';
  const userRole = session?.user?.role || 'Student';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="dashboard-layout">
      {/* Simple Icon Sidebar */}
      <div className="sidebar icon-sidebar">

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
          <button className="logout-btn icon-logout-btn" title="Logout">
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
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
} 