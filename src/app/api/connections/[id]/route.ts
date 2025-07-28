import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/connections/[id] - Get a connection by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing connection id' }, { status: 400 });
  }
  const { data: connection, error } = await supabase
    .from('connections')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !connection) {
    return NextResponse.json({ error: error?.message || 'Connection not found' }, { status: 404 });
  }
  return NextResponse.json({ connection });
}

// PATCH /api/connections/[id] - Update a connection by ID
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing connection id' }, { status: 400 });
  }
  const { data: connection, error } = await supabase
    .from('connections')
    .update(body)
    .eq('id', id)
    .select()
    .single();
  if (error || !connection) {
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 });
  }
  return NextResponse.json({ connection });
}

// DELETE /api/connections/[id] - Delete a connection by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing connection id' }, { status: 400 });
  }
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Connection deleted successfully' });
} 