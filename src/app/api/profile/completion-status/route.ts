export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile data
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        colleges (
          id,
          name,
          domain
        )
      `)
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if profile is complete based on role
    let isComplete = false;
    
    // Check if profile_completed field is explicitly set to true
    if (user.profile_completed === true) {
      isComplete = true;
    } else {
      // If profile_completed is false or null, check required fields based on role
      if (user.role === 'STUDENT') {
        // Check for student-specific required fields
        isComplete = !!(user.current_year && user.graduation_year && user.bio);
      } else if (user.role === 'ALUMNI') {
        // Check for alumni-specific required fields
        isComplete = !!(user.graduation_year && user.current_company && user.job_title && user.experience_years && user.bio);
      } else if (user.role === 'PROFESSOR') {
        // Check for professor-specific required fields
        isComplete = !!(user.designation && user.teaching_experience && user.research_areas && user.bio);
      }
    }

    return NextResponse.json({
      isComplete,
      profileCompleted: user.profile_completed,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        college: user.colleges?.name || 'Unknown College',
        department: user.department,
        bio: user.bio,
        // Student fields
        currentYear: user.current_year,
        graduationYear: user.graduation_year,
        cgpa: user.cgpa,
        // Alumni fields
        currentCompany: user.current_company,
        jobTitle: user.job_title,
        experienceYears: user.experience_years,
        // Professor fields
        designation: user.designation,
        teachingExperience: user.teaching_experience,
        researchAreas: user.research_areas,
        publications: user.publications
      }
    });
  } catch (error) {
    console.error('Profile completion status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 