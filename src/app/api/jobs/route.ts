export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/jobs - Get all jobs with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const company = searchParams.get('company');
        const domain = searchParams.get('domain');
        const experience = searchParams.get('experience');
        const sortBy = searchParams.get('sortBy') || 'recent';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let query = supabase
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
            .eq('status', 'ACTIVE');

        // Apply search filter
        if (search) {
            query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Apply company filter
        if (company) {
            query = query.eq('company', company);
        }

        // Apply domain filter
        if (domain) {
            query = query.eq('domain', domain);
        }

        // Apply experience filter
        if (experience) {
            query = query.eq('experience_level', experience);
        }

        // Apply sorting
        switch (sortBy) {
            case 'company':
                query = query.order('company', { ascending: true });
                break;
            case 'title':
                query = query.order('title', { ascending: true });
                break;
            case 'recent':
            default:
                query = query.order('created_at', { ascending: false });
                break;
        }

        // Get total count
        const { count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'ACTIVE');

        // Get paginated results
        const { data: jobs, error } = await query
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching jobs:', error);
            return NextResponse.json(
                { error: 'Failed to fetch jobs' },
                { status: 500 }
            );
        }

        // Transform jobs to include college name
        const transformedJobs = jobs?.map(job => ({
            ...job,
            postedBy: {
                ...job.posted_by,
                college: job.posted_by.colleges?.name || 'Unknown College',
                rating: job.posted_by.rating || 0
            }
        })) || [];

        return NextResponse.json({
            jobs: transformedJobs,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log('Job POST request - Session:', session);
        console.log('Job POST request - User ID:', session?.user?.id);

        if (!session?.user?.id) {
            console.log('Job POST request - Not authenticated');
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log('Job POST request - Body:', body);

        const {
            title,
            company,
            job_link,
            description,
            eligibility,
            notes,
            is_open_for_referral,
            domain,
            experience_level,
            openings,
            application_deadline
        } = body;

        // Validate required fields
        if (!title || !company || !job_link) {
            console.log('Job POST request - Missing required fields');
            return NextResponse.json(
                { error: 'Title, company, and job link are required' },
                { status: 400 }
            );
        }

        const jobData = {
            title,
            company,
            job_link,
            description: description || null,
            eligibility: eligibility || null,
            notes: notes || null,
            is_open_for_referral: is_open_for_referral !== false, // Default to true
            domain: domain || null,
            experience_level: experience_level || null,
            openings: openings || 1,
            application_deadline: application_deadline || null,
            posted_by: session.user.id,
            status: 'ACTIVE'
        };

        console.log('Job POST request - Job data to insert:', jobData);

        // Create job
        const { data: job, error } = await supabase
            .from('jobs')
            .insert(jobData)
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
            console.error('Job POST request - Supabase error:', error);
            return NextResponse.json(
                { error: `Failed to create job: ${error.message}` },
                { status: 500 }
            );
        }

        console.log('Job POST request - Success, created job:', job);
        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error('Job POST request - Exception:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 