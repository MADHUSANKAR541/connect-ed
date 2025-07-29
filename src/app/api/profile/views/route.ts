export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// POST /api/profile/views - Increment profile views
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { profileUserId } = body;

        if (!profileUserId) {
            return NextResponse.json(
                { error: 'Profile user ID is required' },
                { status: 400 }
            );
        }

        // Don't count self-views
        if (profileUserId === session.user.id) {
            return NextResponse.json({ success: true, message: 'Self-view not counted' });
        }

        // Increment profile views
        const { data, error } = await supabase
            .from('users')
            .update({
                profile_views: supabase.rpc('increment', { row_id: profileUserId, x: 1 })
            })
            .eq('id', profileUserId)
            .select('profile_views')
            .single();

        if (error) {
            console.error('Error incrementing profile views:', error);

            // Fallback: get current count and increment manually
            const { data: currentUser } = await supabase
                .from('users')
                .select('profile_views')
                .eq('id', profileUserId)
                .single();

            const newCount = (currentUser?.profile_views || 0) + 1;

            const { error: updateError } = await supabase
                .from('users')
                .update({ profile_views: newCount })
                .eq('id', profileUserId);

            if (updateError) {
                console.error('Error updating profile views (fallback):', updateError);
                return NextResponse.json(
                    { error: 'Failed to update profile views' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Profile view recorded',
            newCount: data?.profile_views || 0
        });
    } catch (error) {
        console.error('Profile views API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 