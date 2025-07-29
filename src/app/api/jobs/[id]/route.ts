import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// PUT /api/jobs/[id] - Update a job
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
        const {
            title,
            company,
            location,
            jobLink,
            description,
            eligibility,
            notes,
            isOpenForReferral,
            domain,
            experienceLevel,
            salary,
            applicationDeadline
        } = body;

        // Check if the user is authorized to update this job
        const { data: existingJob, error: fetchError } = await supabase
            .from('jobs')
            .select('posted_by')
            .eq('id', id)
            .single();

        if (fetchError || !existingJob) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        if (existingJob.posted_by !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to update this job' },
                { status: 403 }
            );
        }

        // Update the job
        const { data: job, error } = await supabase
            .from('jobs')
            .update({
                title: title || undefined,
                company: company || undefined,
                location: location || null,
                job_link: jobLink || undefined,
                description: description || null,
                eligibility: eligibility || null,
                notes: notes || null,
                is_open_for_referral: isOpenForReferral,
                domain: domain || null,
                experience_level: experienceLevel || null,
                salary: salary || null,
                application_deadline: applicationDeadline || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
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
            .single();

        if (error) {
            console.error('Error updating job:', error);
            return NextResponse.json(
                { error: 'Failed to update job' },
                { status: 500 }
            );
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error('Error updating job:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/jobs/[id] - Delete a job
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

        // Check if the user is authorized to delete this job
        const { data: existingJob, error: fetchError } = await supabase
            .from('jobs')
            .select('posted_by')
            .eq('id', id)
            .single();

        if (fetchError || !existingJob) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        if (existingJob.posted_by !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to delete this job' },
                { status: 403 }
            );
        }

        // Delete the job
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting job:', error);
            return NextResponse.json(
                { error: 'Failed to delete job' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 