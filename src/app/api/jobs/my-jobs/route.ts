import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/jobs/my-jobs - Get jobs posted by the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { data: jobs, error } = await supabase
            .from('jobs')
            .select(`
        *,
        posted_by:users!jobs_posted_by_fkey (
          id,
          name,
          avatar,
          role,
          department,
          colleges (
            id,
            name,
            domain
          )
        )
      `)
            .eq('posted_by', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching my jobs:', error);
            return NextResponse.json(
                { error: 'Failed to fetch jobs' },
                { status: 500 }
            );
        }

        return NextResponse.json({ jobs: jobs || [] });
    } catch (error) {
        console.error('Error fetching my jobs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 