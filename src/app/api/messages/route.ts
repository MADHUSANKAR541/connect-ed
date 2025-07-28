import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/messages - Get messages between two users
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const otherUserId = searchParams.get('otherUserId');
  if (!userId || !otherUserId) {
    return NextResponse.json({ error: 'Missing userId or otherUserId' }, { status: 400 });
  }
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ messages });
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { senderId, receiverId, content, type } = body;
  if (!senderId || !receiverId || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      type: type || 'TEXT',
      is_read: false,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message });
} 