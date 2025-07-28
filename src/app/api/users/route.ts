import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/users - Get users with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const collegeId = searchParams.get('collegeId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select(`
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
      `);

    // Apply filters
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (collegeId && collegeId !== 'all') {
      query = query.eq('college_id', collegeId);
    }

    if (status) {
      if (status === 'pending') {
        query = query.eq('is_verified', false);
      } else if (status === 'verified') {
        query = query.eq('is_verified', true);
      }
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data: users, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Create user in database
    const { data: user, error } = await supabase
      .from('users')
      .insert(userData)
      .select(`
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
      `)
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 