import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId') || userId;

        console.log('Fetching stats for user:', targetUserId);

        // Fetch connections count - Fixed to use correct field names
        const { data: connectionsData, count: connectionsCount, error: connectionsError } = await supabase
            .from('connections')
            .select('*', { count: 'exact' })
            .or(`sender_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`)
            .eq('status', 'ACCEPTED');

        console.log('Connections query result:', { connectionsData, connectionsCount, connectionsError });

        // Alternative query if the above doesn't work
        let finalConnectionsCount = connectionsCount || 0;
        if (connectionsError || connectionsCount === null) {
            console.log('Trying alternative connections query...');
            const { data: altConnections, error: altError } = await supabase
                .from('connections')
                .select('*')
                .or(`sender_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`)
                .eq('status', 'ACCEPTED');

            console.log('Alternative connections query result:', { altConnections, altError });
            finalConnectionsCount = altConnections?.length || 0;
        }

        // Fetch messages count
        const { data: messagesData, count: messagesCount, error: messagesError } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .or(`sender_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`);

        console.log('Messages query result:', { messagesData, messagesCount, messagesError });

        // Fetch calls count
        const { data: callsData, count: callsCount, error: callsError } = await supabase
            .from('calls')
            .select('*', { count: 'exact' })
            .or(`requester_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`)
            .eq('status', 'completed');

        console.log('Calls query result:', { callsData, callsCount, callsError });

        // Fetch profile views from users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('profile_views')
            .eq('id', targetUserId)
            .single();

        console.log('User data for profile views:', { userData, userError });

        const profileViews = userData?.profile_views || 0;

        // Calculate changes (mock data for now - can be enhanced with historical data)
        const connectionsChange = Math.floor(Math.random() * 20) + 5; // 5-25%
        const messagesChange = Math.floor(Math.random() * 15) + 3; // 3-18%
        const callsChange = Math.floor(Math.random() * 5) + 1; // 1-6
        const viewsChange = Math.floor(Math.random() * 25) + 10; // 10-35%

        const stats = {
            connections: finalConnectionsCount,
            messages: messagesCount || 0,
            calls: callsCount || 0,
            profileViews,
            connectionsChange,
            messagesChange,
            callsChange,
            viewsChange
        };

        console.log('Final stats:', stats);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
} 