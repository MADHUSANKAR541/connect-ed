import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...');
    
    // Test 2: Check if users table exists and has data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({
        error: 'Users table error',
        details: usersError
      }, { status: 500 });
    }

    // Test 3: Check if messages table exists
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({
        error: 'Messages table error',
        details: messagesError
      }, { status: 500 });
    }

    // Test 4: Check if notifications table exists
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return NextResponse.json({
        error: 'Notifications table error',
        details: notificationsError
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      messagesCount: messages ? messages.length : 0,
      notificationsCount: notifications ? notifications.length : 0,
      message: 'Database connection and tables are working'
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error
    }, { status: 500 });
  }
} 