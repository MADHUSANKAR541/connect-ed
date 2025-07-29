import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// PUT /api/calls/[id] - Update call status (accept/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Verify the call exists and user is the receiver
    const { data: call, error: fetchError } = await supabase
      .from('call_requests')
      .select('*')
      .eq('id', id)
      .eq('receiver_id', session.user.id)
      .single();

    if (fetchError || !call) {
      return NextResponse.json(
        { error: 'Call not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update call status
    const { data: updatedCall, error: updateError } = await supabase
      .from('call_requests')
      .update({ 
        status: status.toUpperCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating call:', updateError);
      return NextResponse.json(
        { error: 'Failed to update call status' },
        { status: 500 }
      );
    }

    // If call is accepted or rejected, create a notification for the sender
    if (status.toUpperCase() === 'ACCEPTED' || status.toUpperCase() === 'REJECTED') {
      // Get sender information
      const { data: sender, error: senderError } = await supabase
        .from('users')
        .select('name')
        .eq('id', call.sender_id)
        .single();

      if (!senderError && sender) {
        const notificationType = status.toUpperCase() === 'ACCEPTED' ? 'CALL_ACCEPTED' : 'CALL_REJECTED';
        const notificationTitle = status.toUpperCase() === 'ACCEPTED' ? 'Call Request Accepted' : 'Call Request Rejected';
        const notificationMessage = status.toUpperCase() === 'ACCEPTED' 
          ? `Your call request "${call.title}" has been accepted by ${session.user.name}.`
          : `Your call request "${call.title}" has been rejected by ${session.user.name}.`;

        // Create notification for the sender
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: call.sender_id,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            is_read: false,
            data: {
              call_id: id,
              receiver_id: session.user.id,
              receiver_name: session.user.name
            }
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Don't fail the call update if notification fails
        }
      }
    }

    return NextResponse.json({ call: updatedCall });
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calls/[id] - Cancel call
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verify the call exists and user is the sender or receiver
    const { data: call, error: fetchError } = await supabase
      .from('call_requests')
      .select('*')
      .eq('id', id)
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .single();

    if (fetchError || !call) {
      return NextResponse.json(
        { error: 'Call not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update call status to cancelled
    const { error: updateError } = await supabase
      .from('call_requests')
      .update({ 
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error cancelling call:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel call' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Call cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 