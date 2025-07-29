export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// PATCH /api/jobs/requests/[id] - Update referral request status
export async function PATCH(
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

        if (!status || !['ACCEPTED', 'DECLINED', 'REFERRED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Check if the user is authorized to update this request
        // (they should be the job poster)
        const { data: referralRequest, error: fetchError } = await supabase
            .from('referral_requests')
            .select(`
        *,
        job:jobs!referral_requests_job_id_fkey (
          posted_by
        )
      `)
            .eq('id', id)
            .single();

        if (fetchError || !referralRequest) {
            return NextResponse.json(
                { error: 'Request not found' },
                { status: 404 }
            );
        }

        if (referralRequest.job.posted_by !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to update this request' },
                { status: 403 }
            );
        }

        // Update the request status
        const { data: updatedRequest, error } = await supabase
            .from('referral_requests')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
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
            .single();

        if (error) {
            console.error('Error updating referral request:', error);
            return NextResponse.json(
                { error: 'Failed to update request' },
                { status: 500 }
            );
        }

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error('Error updating referral request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 