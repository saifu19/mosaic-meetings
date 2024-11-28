import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from '@/components/KanbanBoard/KanbanBoard';
import { Meeting, KanbanColumn } from '@/types';
import { MeetingDialog } from '@/components/MeetingDialog/MeetingDialog';
import { useModalStates } from '@/hooks/useModalStates';
import axios from 'axios';
import { initialKanbanColumns } from '@/data/mockData';
import { MeetingCard } from '@/components/MeetingCard/MeetingCard';
import { config as cfg } from '@/config/env';

export const MeetingsAndKanbanView = () => {
    const [existingMeetings, setExistingMeetings] = useState<Partial<Meeting>[]>([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState<Partial<Meeting>[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedMeeting, setSelectedMeeting] = useState<Partial<Meeting> | undefined>(undefined);
    const [editMode, setEditMode] = useState(false);
    const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(initialKanbanColumns);
    const navigate = useNavigate();
    const onEditMeetingClick = (meeting: Partial<Meeting>) => {
        setSelectedMeeting(meeting);
        setEditMode(true);
        modals.addMeeting.open();
    };

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await axios.get(`${cfg.apiUrl}/api/get-meetings`)
                const { upcoming, existing } = formatMeetings(response.data)
                console.log(upcoming, existing)
                setUpcomingMeetings(upcoming)
                setExistingMeetings(existing)
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching meetings:', error.message)
                } else {
                    console.error('Error fetching meetings:', String(error))
                }
            }
        }

        fetchMeetings()
    }, [refreshTrigger]);

    const formatMeetings = (meetings: any[]) => {
        const now = new Date()

        const formattedMeetings = meetings.map(meeting => {
            const meetingDate = meeting.time ? new Date(meeting.time) : new Date()
            const startTime = new Date(meetingDate.toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }))
            return {
                id: meeting.id,
                title: meeting.title,
                description: meeting.agenda,
                rawTime: new Date(meeting.time),
                startTime: startTime,
                endTime: null,
                link: meeting.link,
                isJoined: meeting.is_joined,
                participants: meeting[10] ? meeting[10] : [],
                status: meetingDate > now ? 'Upcoming' : 'Past',
                // transcriptItems: meeting[7] ? meeting[7] : [],
                // agendaItems: meeting[8] ? meeting[8].map((item: string[]) => ({
                //     id: item[0],
                //     title: item[1],
                // })) : [],
                // insights: meeting[9] ? meeting[9] : [],
                meetingType: meeting.meeting_type,
            }
        })
        console.log(formattedMeetings)
        const upcoming = formattedMeetings.filter(meeting => meeting.rawTime > now)
        console.log(upcoming)
        const existing = formattedMeetings.filter(meeting => meeting.rawTime <= now)
        console.log(existing)
        return { upcoming, existing }
    }

    const modals = useModalStates();
    return (
        <div className="p-4" style={{ width: '100%' }}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">MojoMosaic Meeting Facilitator</h1>
                <div className="space-x-2">
                    <Button
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={modals.addMeeting.open}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Meeting
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/agents')}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Agents Crud
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/meeting-types')}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Meeting Types Crud
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
                    <TabsTrigger value="previous">Previous Meetings</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingMeetings.map(meeting => (
                            <MeetingCard meeting={meeting} onEditMeetingClick={onEditMeetingClick}/>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="previous">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {existingMeetings.map(meeting => (
                            <MeetingCard meeting={meeting} onEditMeetingClick={onEditMeetingClick}/>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="kanban">
                    <KanbanBoard
                        columns={kanbanColumns}
                        setColumns={setKanbanColumns}
                    />
                </TabsContent>
            </Tabs>

            <MeetingDialog
                isOpen={modals.addMeeting.isOpen}
                onClose={() => {
                    modals.addMeeting.close();
                    setSelectedMeeting(undefined);
                    setEditMode(false);
                }}
                onMeetingUpdated={() => setRefreshTrigger(prev => prev + 1)}
                mode={editMode ? 'edit' : 'add'}
                initialData={selectedMeeting}
            />
        </div>
    );
}; 