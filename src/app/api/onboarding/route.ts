import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Onboarding request body:', body);
    
    const { userId, college, department, batch, bio } = body;
    if (!userId || !college) {
      console.log('Missing required fields:', { userId, college });
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
    
    console.log('Updating user:', userId, 'with college_id:', collegeRecord.id);
    // Update user profile
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        college_id: collegeRecord.id,
        department,
        batch,
        bio,
      })
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