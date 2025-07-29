export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check user's verification status in database
    const { data: user, error } = await supabase
      .from('users')
      .select('is_verified')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user status:', error);
      return NextResponse.json(
        { error: 'Failed to check status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isVerified: user.is_verified,
      message: user.is_verified ? 'User is verified' : 'User is not verified'
    });

  } catch (error) {
    console.error('Error in check-status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 