'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing connection...');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('colleges').select('count');
        
        if (error) {
          setStatus(`Error: ${error.message}`);
          return;
        }

        setStatus('✅ Supabase connection successful!');

        // Get list of tables
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        if (!tablesError && tablesData) {
          setTables(tablesData.map((t: any) => t.table_name));
        }

      } catch (error) {
        setStatus(`❌ Connection failed: ${error}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-sm">{status}</p>
      </div>

      {tables.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Tables found:</h2>
          <ul className="list-disc list-inside">
            {tables.map((table) => (
              <li key={table} className="text-sm">{table}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Next Steps:</h2>
        <ul className="list-disc list-inside text-sm">
          <li>✅ Supabase client installed</li>
          <li>✅ Tables created in Supabase</li>
          <li>✅ Connection tested</li>
          <li>🔄 Next: Update API routes to use Supabase</li>
          <li>🔄 Next: Update components to use Supabase</li>
        </ul>
      </div>
    </div>
  );
} 