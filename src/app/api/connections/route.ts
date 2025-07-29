export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/connections - Get user's connections
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

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
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    // Get total count for current user
    const { count } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

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

    // Transform connections to show the other user and determine if current user is sender
    const transformedConnections = connections?.map(connection => {
      const isSender = connection.sender_id === session.user.id;
      const otherUser = isSender ? connection.receiver : connection.sender;
      
      return {
        id: connection.id,
        status: connection.status,
        message: connection.message,
        createdAt: connection.created_at,
        updatedAt: connection.updated_at,
        user: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
          role: otherUser.role,
          college: otherUser.colleges?.name || 'Unknown College',
          department: otherUser.department,
          location: otherUser.location,
          rating: otherUser.rating || 0,
          isOnline: otherUser.is_online || false,
        },
        isSender,
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiverId, message } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('connections')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`)
      .single();

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 409 }
      );
    }

    // Create connection request
    const { data: connection, error: connectionError } = await supabase
      .from('connections')
      .insert({
        sender_id: session.user.id,
        receiver_id: receiverId,
        message,
        status: 'PENDING',
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