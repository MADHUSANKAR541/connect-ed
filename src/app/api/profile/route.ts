import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

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
      console.error('Error fetching profile:', error);
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      bio,
      linkedin,
      github,
      // Student-specific fields
      currentYear,
      graduationYear,
      cgpa,
      // Alumni-specific fields
      currentCompany,
      jobTitle,
      experienceYears,
      // Professor-specific fields
      designation,
      teachingExperience,
      researchAreas,
      publications
    } = body;

    // Prepare update data
    const updateData: any = {
      name: name || undefined,
      bio: bio || undefined,
      linkedin: linkedin || null,
      github: github || null,
    };

    // Add role-specific fields based on user's current role
    if (session.user.role === 'STUDENT') {
      updateData.current_year = currentYear;
      updateData.graduation_year = graduationYear;
      updateData.cgpa = cgpa;
    } else if (session.user.role === 'ALUMNI') {
      updateData.graduation_year = graduationYear;
      updateData.current_company = currentCompany;
      updateData.job_title = jobTitle;
      updateData.experience_years = experienceYears;
    } else if (session.user.role === 'PROFESSOR') {
      updateData.designation = designation;
      updateData.teaching_experience = teachingExperience;
      updateData.research_areas = researchAreas;
      updateData.publications = publications;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select(`
        *,
        colleges (
          id,
          name,
          domain
        )
      `)
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 