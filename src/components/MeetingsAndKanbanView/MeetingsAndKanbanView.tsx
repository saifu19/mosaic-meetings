import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { KanbanBoard } from '@/components/KanbanBoard/KanbanBoard';
import { Meeting, KanbanColumn } from '@/types';
import { MeetingDialog } from '@/components/MeetingDialog/MeetingDialog';
import { CreateMeetingTypeDialog } from '@/components/CreateMeetingTypeDialog/CreateMeetingTypeDialog';
import { useModalStates } from '@/hooks/useModalStates';
import axios from 'axios';
import { meetingTypes } from '@/data/mockData';

interface MeetingsAndKanbanViewProps {
    kanbanColumns: KanbanColumn[];
    setKanbanColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
    onMeetingSelect: (id: string) => void;
}

export const MeetingsAndKanbanView: React.FC<MeetingsAndKanbanViewProps> = ({
    kanbanColumns,
    setKanbanColumns,
    onMeetingSelect
}) => {
    const [existingMeetings, setExistingMeetings] = useState<Meeting[]>([]);
	const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | undefined>(undefined);
    const [editMode, setEditMode] = useState(false);

    const onEditMeetingClick = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setEditMode(true);
        modals.addMeeting.open();
    };
    
    useEffect(() => {
		const fetchMeetings = async () => {
			try {
				const response = await axios.get('https://mojomosaic.live:8443/get-meetings')
				const { upcoming, existing } = formatMeetings(response.data)
                console.log(upcoming, existing)
				setUpcomingMeetings(upcoming)
				setExistingMeetings(existing)
				// setMeetings([...upcoming, ...existing])
				// const isAnyMeetingJoined = existing.some(meeting => meeting.isJoined) || upcoming.some(meeting => meeting.isJoined)
				// setHasJoinedMeeting(isAnyMeetingJoined)
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
			const meetingDate = meeting[3] ? new Date(meeting[3]) : new Date()
			const startTime = new Date(meetingDate.toLocaleString([], {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}))
			return {
				id: meeting[0],
				title: meeting[1],
				description: meeting[2],
				rawTime: meetingDate,
				startTime: startTime,
				endTime: null,
				link: meeting[4],
				isJoined: meeting[5],
				participants: meeting[6] ? meeting[6] : [],
				status: meetingDate > now ? 'Upcoming' : 'Past',
				transcriptItems: meeting[7] ? meeting[7] : [],
				agendaItems: meetingTypes.scrum.defaultAgendaItems,
				insights: meeting[9] ? meeting[9] : [],
			}
		})

		const upcoming = formattedMeetings.filter(meeting => meeting.rawTime > now)
		const existing = formattedMeetings.filter(meeting => meeting.rawTime <= now)
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
                        onClick={modals.createMeetingType.open}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Create Meeting Type
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
                            <Card
                                key={meeting.id}
                                className="cursor-pointer"
                                onClick={() => onMeetingSelect(meeting.id)}
                            >
                                <CardHeader className='d-flex'>
                                    <CardTitle className='d-inline'>{meeting.title}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();  // Prevent card click event
                                            onEditMeetingClick(meeting);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <p>{meeting.description}</p>
                                    <div className="mt-2 flex items-center">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        <span>
                                            {meeting.startTime
                                                ? new Date(meeting.startTime).toLocaleString()
                                                : 'Not started'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="previous">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {existingMeetings.map(meeting => (
                            <Card key={meeting.id}>
                                <CardHeader>
                                    <CardTitle>{meeting.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{meeting.description}</p>
                                    <div className="mt-2 flex items-center">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        <span>{new Date(meeting.startTime!).toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
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
            
            <CreateMeetingTypeDialog
                isOpen={modals.createMeetingType.isOpen}
                onClose={modals.createMeetingType.close}
            />  
        </div>
    );
}; 