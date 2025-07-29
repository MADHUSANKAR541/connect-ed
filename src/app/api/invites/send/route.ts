import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phoneNumber, message } = await request.json();

    // Validate input
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Format phone number (remove any non-digit characters except +)
    const formattedPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Ensure phone number starts with + if it doesn't already
    const phoneWithPlus = formattedPhone.startsWith('+') ? formattedPhone : `+${formattedPhone}`;

    // Create the invite message
    const inviteMessage = message || `Hi ${name}! You've been invited to join CampusConnect - a platform for students, alumni, and professors to connect and network. Join us at ${process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnect.com'} to start building your professional network!`;

    // Send SMS using Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: inviteMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneWithPlus
    });

    // Log the invite for tracking
    console.log(`Invite sent to ${phoneWithPlus} for ${name} by user ${session.user.id}`);

    return NextResponse.json({ 
      success: true, 
      messageId: twilioMessage.sid,
      message: 'Invite sent successfully'
    });

  } catch (error: any) {
    console.error('Error sending invite:', error);
    
    // Handle Twilio-specific errors
    if (error.code === 21211) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }
    
    if (error.code === 21608) {
      return NextResponse.json({ error: 'Phone number is not verified for testing' }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to send invite. Please try again.' 
    }, { status: 500 });
  }
} 