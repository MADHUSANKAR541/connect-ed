import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/jobs/referral-requests - Get referral requests for jobs posted by the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { data: requests, error } = await supabase
            .from('referral_requests')
            .select(`
        *,
        job:jobs!referral_requests_job_id_fkey (
          id,
          title,
          company,
          location,
          job_link
        ),
        student:users!referral_requests_student_id_fkey (
          id,
          name,
          avatar,
          role,
          department,
          current_year,
          graduation_year,
          cgpa,
          colleges (
            id,
            name,
            domain
          )
        )
      `)
            .eq('job.posted_by', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching referral requests:', error);
            return NextResponse.json(
                { error: 'Failed to fetch requests' },
                { status: 500 }
            );
        }

        return NextResponse.json({ requests: requests || [] });
    } catch (error) {
        console.error('Error fetching referral requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 