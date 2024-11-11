// MeetingDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MeetingsAndKanbanView } from '@/components/MeetingsAndKanbanView/MeetingsAndKanbanView';
import { AddMeetingDialog } from '@/components/AddMeetingDialog/AddMeetingDialog';
import { CreateMeetingTypeDialog } from '@/components/CreateMeetingTypeDialog/CreateMeetingTypeDialog';
import { useModalStates } from '@/hooks/useModalStates';
import axios from 'axios';
import { Meeting, KanbanColumn } from '@/types';
import { initialKanbanColumns } from '@/data/mockData';
import { meetingTypes } from '@/data/mockData'; // Update the path if `meetingTypes` is defined elsewhere


function meetingDashboard() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

    const [existingMeetings, setExistingMeetings] = useState<Meeting[]>([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(initialKanbanColumns);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const modals = useModalStates();
    const navigate = useNavigate();

    const updateSelectedMeeting = (id: string) => {
        setSelectedMeetingId(id);  // Update the selected meeting state
        console.log("Selected meeting ID:", id);
    };

    // Call this function when selecting a meeting
    const onMeetingSelect = (id: string) => {
        updateSelectedMeeting(id);   // Call to update the selected meeting
        navigate(`/meeting/${id}`);  // Navigate to the meeting detail page
    };

    const fetchMeetings = async () => {
        try {
            const response = await axios.get('https://mojomosaic.live:8443/get-meetings');
            const { upcoming, existing } = formatMeetings(response.data);
            setUpcomingMeetings(upcoming);
            setExistingMeetings(existing);
            setMeetings([...upcoming, ...existing]);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        }
    };

    const formatMeetings = (meetings: any[]) => {
        const now = new Date();
        
        const formattedMeetings = meetings.map(meeting => {
            const meetingDate = new Date(meeting[3] || new Date());
            
            return {
                id: meeting[0],
                title: meeting[1],
                description: meeting[2],
                rawTime: meetingDate,
                startTime: meetingDate,
                endTime: meeting[8] ? new Date(meeting[8]) : null, // Provide a default value for `endTime`
                link: meeting[4],
                isJoined: meeting[5],
                participants: meeting[6] || [],
                status: meetingDate > now ? 'Upcoming' : 'Past',
                transcriptItems: meeting[7] || [],
                agendaItems: meetingTypes.scrum.defaultAgendaItems,
                insights: meeting[9] || [],
            };
        });
    
        const upcoming = formattedMeetings.filter(meeting => meeting.rawTime > now);
        const existing = formattedMeetings.filter(meeting => meeting.rawTime <= now);
        return { upcoming, existing };
    };

    useEffect(() => {
        fetchMeetings();
    }, [refreshTrigger]);

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-gray-100">
                <MeetingsAndKanbanView
                    kanbanColumns={kanbanColumns}
                    setKanbanColumns={setKanbanColumns}
                    onMeetingSelect={onMeetingSelect}
                />
            </div>
        </TooltipProvider>
    );
}

export default meetingDashboard;
