import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/jobs/requests - Get referral requests for the authenticated user
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
        const type = searchParams.get('type'); // 'sent' or 'received'

        if (type === 'sent') {
            // Get requests sent by the student
            const { data: requests, error } = await supabase
                .from('referral_requests')
                .select(`
          *,
          job:jobs!referral_requests_job_id_fkey (
            id,
            title,
            company,
            location,
            job_link,
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
          )
        `)
                .eq('student_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching sent requests:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch requests' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ requests: requests || [] });
        } else {
            // Get requests received by the alumni (for jobs they posted)
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
                console.error('Error fetching received requests:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch requests' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ requests: requests || [] });
        }
    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/jobs/requests - Create a new referral request
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const jobId = formData.get('jobId') as string;
        const note = formData.get('note') as string;
        const resumeFile = formData.get('resume') as File;

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // Check if job exists and is open for referrals
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .eq('is_open_for_referral', true)
            .single();

        if (jobError || !job) {
            return NextResponse.json(
                { error: 'Job not found or not open for referrals' },
                { status: 404 }
            );
        }

        // Check if user already has a pending request for this job
        const { data: existingRequest } = await supabase
            .from('referral_requests')
            .select('*')
            .eq('job_id', jobId)
            .eq('student_id', session.user.id)
            .single();

        if (existingRequest) {
            return NextResponse.json(
                { error: 'You already have a request for this job' },
                { status: 409 }
            );
        }

        let resumeUrl = null;

        // Upload resume if provided
        if (resumeFile) {
            const fileName = `resumes/${session.user.id}/${Date.now()}_${resumeFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('job-resumes')
                .upload(fileName, resumeFile);

            if (uploadError) {
                console.error('Error uploading resume:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload resume' },
                    { status: 500 }
                );
            }

            const { data: urlData } = supabase.storage
                .from('job-resumes')
                .getPublicUrl(fileName);

            resumeUrl = urlData.publicUrl;
        }

        // Create referral request
        const { data: referralRequest, error } = await supabase
            .from('referral_requests')
            .insert({
                job_id: jobId,
                student_id: session.user.id,
                note: note || '',
                resume_url: resumeUrl,
                status: 'PENDING'
            })
            .select(`
        *,
        job:jobs!referral_requests_job_id_fkey (
          id,
          title,
          company,
          location,
          job_link,
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
        )
      `)
            .single();

        if (error) {
            console.error('Error creating referral request:', error);
            return NextResponse.json(
                { error: 'Failed to create request' },
                { status: 500 }
            );
        }

        return NextResponse.json(referralRequest, { status: 201 });
    } catch (error) {
        console.error('Error creating referral request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 