import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Onboarding request body:', body);
    
    const { 
      userId, 
      college, 
      department, 
      bio, 
      role,
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
    
    if (!userId || !college || !role) {
      console.log('Missing required fields:', { userId, college, role });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    console.log('Looking for college:', college);
    // Find or create college
    let { data: collegeRecord, error: collegeError } = await supabase
      .from('colleges')
      .select('*')
      .eq('name', college)
      .single();
      
    if (collegeError) {
      console.log('College lookup error:', collegeError);
    }
    
    if (!collegeRecord) {
      console.log('Creating new college:', college);
      const timestamp = Date.now();
      const uniqueDomain = `${college.toLowerCase().replace(/\s+/g, '')}-${timestamp}.edu`;
      
      const { data: newCollege, error: createCollegeError } = await supabase
        .from('colleges')
        .insert({
          name: college,
          domain: uniqueDomain,
          status: 'ACTIVE',
        })
        .select()
        .single();
        
      if (createCollegeError) {
        console.log('College creation error:', createCollegeError);
        return NextResponse.json({ error: createCollegeError.message }, { status: 500 });
      }
      
      collegeRecord = newCollege;
    }
    
    // Prepare user update data with role-specific fields
    const userUpdateData: any = {
      college_id: collegeRecord.id,
      department,
      bio,
      role,
      linkedin: linkedin || null,
      github: github || null,
    };

    // Add role-specific fields
    if (role === 'STUDENT') {
      userUpdateData.current_year = currentYear;
      userUpdateData.graduation_year = graduationYear;
      userUpdateData.cgpa = cgpa;
    } else if (role === 'ALUMNI') {
      userUpdateData.graduation_year = graduationYear;
      userUpdateData.current_company = currentCompany;
      userUpdateData.job_title = jobTitle;
      userUpdateData.experience_years = experienceYears;
    } else if (role === 'PROFESSOR') {
      userUpdateData.designation = designation;
      userUpdateData.teaching_experience = teachingExperience;
      userUpdateData.research_areas = researchAreas;
      userUpdateData.publications = publications;
    }
    
    console.log('Updating user:', userId, 'with data:', userUpdateData);
    // Update user profile
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update(userUpdateData)
      .eq('id', userId)
      .select()
      .single();
      
    if (updateError) {
      console.log('User update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    if (!user) {
      console.log('No user found with ID:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('Onboarding successful for user:', user.id);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 