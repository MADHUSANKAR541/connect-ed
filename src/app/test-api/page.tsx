'use client';

import { useState } from 'react';

export default function TestAPI() {
  const [users, setUsers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testUsersAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const testConnectionsAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/connections');
      const data = await response.json();
      
      if (response.ok) {
        setConnections(data.connections || []);
        console.log('Connections API response:', data);
      } else {
        setError(data.error || 'Failed to fetch connections');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const testMessagesAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get first user ID for testing
      if (users.length === 0) {
        setError('No users available. Please test Users API first.');
        return;
      }
      
      const userId = users[0].id;
      const response = await fetch(`/api/messages?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages || []);
        console.log('Messages API response:', data);
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const testNotificationsAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications || []);
        console.log('Notifications API response:', data);
      } else {
        setError(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Routes Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testUsersAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Users API'}
        </button>
        
        <button
          onClick={testConnectionsAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Testing...' : 'Test Connections API'}
        </button>
        
        <button
          onClick={testMessagesAPI}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Testing...' : 'Test Messages API'}
        </button>
        
        <button
          onClick={testNotificationsAPI}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Testing...' : 'Test Notifications API'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {users.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Users found: {users.length}</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="p-3 bg-gray-100 rounded">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {connections.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Connections found: {connections.length}</h2>
          <div className="space-y-2">
            {connections.map((connection) => (
              <div key={connection.id} className="p-3 bg-gray-100 rounded">
                <p><strong>Status:</strong> {connection.status}</p>
                <p><strong>Message:</strong> {connection.message}</p>
                <p><strong>User:</strong> {connection.user?.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Messages found: {messages.length}</h2>
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="p-3 bg-gray-100 rounded">
                <p><strong>Content:</strong> {message.content}</p>
                <p><strong>Type:</strong> {message.type}</p>
                <p><strong>Sender:</strong> {message.sender?.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Notifications found: {notifications.length}</h2>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 bg-gray-100 rounded">
                <p><strong>Title:</strong> {notification.title}</p>
                <p><strong>Message:</strong> {notification.message}</p>
                <p><strong>Type:</strong> {notification.type}</p>
                <p><strong>Read:</strong> {notification.is_read ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Migration Status:</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>✅ Supabase client configured</li>
          <li>✅ Database tables created</li>
          <li>✅ Users API route updated</li>
          <li>✅ Connections API route updated</li>
          <li>✅ Messages API route updated</li>
          <li>✅ Notifications API route updated</li>
          <li>🔄 Next: Update remaining API routes</li>
          <li>🔄 Next: Set up authentication</li>
          <li>🔄 Next: Update frontend components</li>
        </ul>
      </div>
    </div>
  );
} 