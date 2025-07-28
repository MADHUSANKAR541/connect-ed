import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      role = 'STUDENT',
      college,
      department,
    } = body;

    // Validate required fields
    if (!email || !password || !name || !college) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Find or create college
    let { data: collegeRecord, error: collegeError } = await supabase
      .from('colleges')
      .select('*')
      .eq('name', college)
      .single();
    if (!collegeRecord) {
      const { data: newCollege, error: createCollegeError } = await supabase
        .from('colleges')
        .insert({
          name: college,
          domain: `${college.toLowerCase().replace(/\s+/g, '')}.edu`,
          status: 'ACTIVE',
        })
        .select()
        .single();
      collegeRecord = newCollege;
    }

    // Create user
    const { data: user, error: createUserError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role,
        college_id: collegeRecord.id,
        department,
        avatar: name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      })
      .select()
      .single();

    if (createUserError) {
      return NextResponse.json(
        { error: createUserError.message || 'Signup failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        college_id: user.college_id,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 