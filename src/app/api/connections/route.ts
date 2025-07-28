import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/connections - Get user's connections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('connections')
      .select(`
        *,
        sender:users!connections_sender_id_fkey (
          *,
          colleges (
            id,
            name,
            domain
          ),
          user_skills (
            skill,
            level,
            category
          )
        ),
        receiver:users!connections_receiver_id_fkey (
          *,
          colleges (
            id,
            name,
            domain
          ),
          user_skills (
            skill,
            level,
            category
          )
        )
      `);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Get total count
    const { count } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data: connections, error } = await query
      .range(offset, offset + limit - 1)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching connections:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Transform connections to show the other user
    const transformedConnections = connections?.map(connection => {
      const otherUser = connection.receiver;
      
      return {
        id: connection.id,
        status: connection.status,
        message: connection.message,
        createdAt: connection.created_at,
        updatedAt: connection.updated_at,
        user: otherUser,
        isSender: false,
      };
    }) || [];

    return NextResponse.json({
      connections: transformedConnections,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/connections - Send connection request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiverId, message } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    // Create connection request
    const { data: connection, error: connectionError } = await supabase
      .from('connections')
      .insert({
        sender_id: 'test-sender-id', // Temporary for testing
        receiver_id: receiverId,
        message,
      })
      .select(`
        *,
        sender:users!connections_sender_id_fkey (
          *,
          colleges (
            id,
            name,
            domain
          )
        ),
        receiver:users!connections_receiver_id_fkey (
          *,
          colleges (
            id,
            name,
            domain
          )
        )
      `)
      .single();

    if (connectionError) {
      console.error('Error creating connection:', connectionError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 