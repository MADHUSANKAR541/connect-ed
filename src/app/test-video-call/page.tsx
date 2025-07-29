'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import VideoCall from '@/components/VideoCall';

export default function TestVideoCallPage() {
  const { data: session } = useSession();
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [roomName, setRoomName] = useState('test-room-' + Math.random().toString(36).substring(7));
  const [userName, setUserName] = useState('');

  const handleStartCall = () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    setShowVideoCall(true);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Video Call Test</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room Name:</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter room name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">User Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter your name"
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Enter the same room name in both browsers</li>
              <li>Enter different user names for each browser</li>
              <li>Click "Start Test Call" in both browsers</li>
              <li>Allow camera/microphone permissions when prompted</li>
              <li>Check browser console for debug messages</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">If participants can't see each other:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                <li>• Click the "Users" button to check participant count</li>
                <li>• Click the "Settings" button to refresh the call</li>
                <li>• Try using incognito mode in one browser</li>
                <li>• Check if both users have camera/microphone enabled</li>
                <li>• Try different browsers (Chrome + Firefox)</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={handleStartCall}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Test Call
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Current User:</strong> {session?.user?.name || 'Not logged in'}</p>
          <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
          <p><strong>Room Name:</strong> {roomName}</p>
          <p><strong>Display Name:</strong> {userName || session?.user?.name || 'User'}</p>
        </div>
      </div>

      {showVideoCall && (
        <VideoCall
          roomName={roomName}
          userName={userName || session?.user?.name || 'User'}
          onClose={() => setShowVideoCall(false)}
          isOpen={showVideoCall}
        />
      )}
    </div>
  );
} 