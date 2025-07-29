export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/connections/[id] - Get a connection by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Missing connection id' }, { status: 400 });
    }

    const { data: connection, error } = await supabase
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
      .eq('id', id)
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .single();

    if (error || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('Error fetching connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/connections/[id] - Update a connection by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing connection id' }, { status: 400 });
    }

    // Check if connection exists and user has permission to update it
    const { data: existingConnection, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .single();

    if (fetchError || !existingConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Only the receiver can accept/reject a connection
    if (existingConnection.receiver_id !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update this connection' }, { status: 403 });
    }

    // Update connection
    const { data: connection, error } = await supabase
      .from('connections')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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

    if (error || !connection) {
      console.error('Error updating connection:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/connections/[id] - Update a connection by ID (alias for PUT)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return PUT(request, { params });
}

// DELETE /api/connections/[id] - Delete a connection by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Missing connection id' }, { status: 400 });
    }

    // Check if connection exists and user has permission to delete it
    const { data: existingConnection, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .single();

    if (fetchError || !existingConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting connection:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 