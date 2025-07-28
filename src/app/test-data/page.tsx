'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function TestData() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addTestCollege = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase
        .from('colleges')
        .insert({
          name: 'Test University',
          domain: 'test.edu',
          status: 'ACTIVE',
          description: 'A test university for development',
          website: 'https://test.edu',
          location: 'Test City, TS'
        })
        .select()
        .single();

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`✅ College created: ${data.name}`);
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const addTestUsers = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // First, get the college ID
      const { data: colleges } = await supabase
        .from('colleges')
        .select('id')
        .limit(1);

      if (!colleges || colleges.length === 0) {
        setMessage('❌ No college found. Please add a college first.');
        return;
      }

      const collegeId = colleges[0].id;

      // Remove testUsers array and insertion
      // const testUsers = [
      //   {
      //     email: 'john@test.edu',
      //     name: 'John Doe',
      //     role: 'STUDENT',
      //     college_id: collegeId,
      //     department: 'Computer Science',
      //     batch: '2024',
      //     bio: 'Passionate about technology and innovation',
      //     is_verified: true,
      //     is_online: true,
      //     rating: 4.5,
      //     profile_views: 25
      //   },
      //   {
      //     email: 'sarah@test.edu',
      //     name: 'Sarah Smith',
      //     role: 'ALUMNI',
      //     college_id: collegeId,
      //     department: 'Business Administration',
      //     bio: 'Experienced business professional',
      //     is_verified: true,
      //     is_online: false,
      //     rating: 4.8,
      //     profile_views: 42
      //   },
      //   {
      //     email: 'prof.davis@test.edu',
      //     name: 'Professor Davis',
      //     role: 'PROFESSOR',
      //     college_id: collegeId,
      //     department: 'Engineering',
      //     bio: 'Senior professor with 15 years of experience',
      //     is_verified: true,
      //     is_online: true,
      //     rating: 4.9,
      //     profile_views: 67
      //   }
      // ];
      // const { data: users, error } = await supabase.from('users').insert(testUsers).select();
      setMessage('Test user creation is disabled.');
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const addTestConnections = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Get user IDs
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(3);

      if (!users || users.length < 2) {
        setMessage('❌ Need at least 2 users. Please add users first.');
        return;
      }

      const testConnections = [
        {
          sender_id: users[0].id,
          receiver_id: users[1].id,
          status: 'ACCEPTED',
          message: 'Great to connect with you!'
        },
        {
          sender_id: users[1].id,
          receiver_id: users[2].id,
          status: 'PENDING',
          message: 'Would love to connect and discuss opportunities.'
        }
      ];

      const { data: connections, error } = await supabase
        .from('connections')
        .insert(testConnections)
        .select();

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`✅ ${connections?.length || 0} connections created successfully!`);
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Clear all data (in reverse order due to foreign keys)
      await supabase.from('connections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('colleges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      setMessage('✅ All test data cleared!');
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Data Management</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={addTestCollege}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Test College'}
        </button>
        
        <button
          onClick={addTestUsers}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Adding...' : 'Add Test Users'}
        </button>
        
        <button
          onClick={addTestConnections}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Adding...' : 'Add Test Connections'}
        </button>
        
        <button
          onClick={clearAllData}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Clearing...' : 'Clear All Data'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded ${
          message.includes('✅') 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Click "Add Test College" first</li>
          <li>Then click "Add Test Users"</li>
          <li>Finally click "Add Test Connections"</li>
          <li>Go back to <a href="/test-api" className="text-blue-500 underline">Test API page</a> to see the data</li>
        </ol>
      </div>
    </div>
  );
} 