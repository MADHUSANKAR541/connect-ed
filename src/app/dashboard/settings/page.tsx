'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  MessageSquare, 
  Calendar,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';
import '../../../styles/settings.scss';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    messagePrivacy: 'connections',
    callRequests: 'connections',
    notifications: true
  });

  const handleSettingChange = (setting: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <div className="logo-section">
            <h2 className="logo">ConnectED</h2>
          </div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences and privacy settings</p>
        </div>
      </div>

      <div className="settings-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="settings-grid"
        >
          <div className="setting-card">
            <div className="setting-header">
              <div className="setting-icon">
                <Eye size={20} />
              </div>
              <div className="setting-info">
                <h3>Profile Visibility</h3>
                <p>Control who can see your profile</p>
              </div>
            </div>
            <div className="setting-controls">
              <select 
                className="visibility-select"
                value={settings.profileVisibility}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              >
                <option value="public">Public</option>
                <option value="connections">Connections Only</option>
                <option value="college">College Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <div className="setting-icon">
                <MessageSquare size={20} />
              </div>
              <div className="setting-info">
                <h3>Message Privacy</h3>
                <p>Who can send you messages</p>
              </div>
            </div>
            <div className="setting-controls">
              <select 
                className="visibility-select"
                value={settings.messagePrivacy}
                onChange={(e) => handleSettingChange('messagePrivacy', e.target.value)}
              >
                <option value="connections">Connections Only</option>
                <option value="college">College Members</option>
                <option value="public">Everyone</option>
              </select>
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <div className="setting-icon">
                <Calendar size={20} />
              </div>
              <div className="setting-info">
                <h3>Call Requests</h3>
                <p>Who can request calls with you</p>
              </div>
            </div>
            <div className="setting-controls">
              <select 
                className="visibility-select"
                value={settings.callRequests}
                onChange={(e) => handleSettingChange('callRequests', e.target.value)}
              >
                <option value="connections">Connections Only</option>
                <option value="college">College Members</option>
                <option value="public">Everyone</option>
              </select>
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <div className="setting-icon">
                <Bell size={20} />
              </div>
              <div className="setting-info">
                <h3>Notifications</h3>
                <p>Manage your notification preferences</p>
              </div>
            </div>
            <div className="setting-controls">
              <button className="btn btn-outline">
                Configure
              </button>
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <div className="setting-icon">
                <SettingsIcon size={20} />
              </div>
              <div className="setting-info">
                <h3>Account Settings</h3>
                <p>Manage your account and security settings</p>
              </div>
            </div>
            <div className="setting-controls">
              <button className="btn btn-outline">
                Manage Account
              </button>
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <div className="setting-icon">
                <Eye size={20} />
              </div>
              <div className="setting-info">
                <h3>Data Privacy</h3>
                <p>Control your data and privacy settings</p>
              </div>
            </div>
            <div className="setting-controls">
              <button className="btn btn-outline">
                Privacy Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 