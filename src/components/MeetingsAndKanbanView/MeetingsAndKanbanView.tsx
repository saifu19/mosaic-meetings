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

interface MeetingsAndKanbanViewProps {
    existingMeetings: Meeting[];
    upcomingMeetings: Meeting[];
    kanbanColumns: KanbanColumn[];
    setKanbanColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
    onMeetingSelect: (id: string) => void;
    onAddMeetingClick: () => void;
    setRefreshTrigger: () => void;
}

export const MeetingsAndKanbanView: React.FC<MeetingsAndKanbanViewProps> = ({
    // existingMeetings,
    // upcomingMeetings,
    kanbanColumns,
    setKanbanColumns,
    onMeetingSelect,
    setRefreshTrigger,
}) => {
    const [existingMeetings, setExistingMeetings] = useState<Meeting[]>([]);
	const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    
    useEffect(() => {
		const fetchMeetings = async () => {
			try {
				const response = await axios.get('https://mojomosaic.live:8443/get-meetings')
				const { upcoming, existing } = formatMeetings(response.data)
				setUpcomingMeetings(upcoming)
				setExistingMeetings(existing)
				setMeetings([...upcoming, ...existing])
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


    const modals = useModalStates();
    return (
        <div className="p-4">
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
                                <CardHeader>
                                    <CardTitle>{meeting.title}</CardTitle>
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

            {/* Add Meeting Dialog */}
            <MeetingDialog
                isOpen={modals.addMeeting.isOpen}
                onClose={modals.addMeeting.close}
                setMeetings={setMeetings}
                onMeetingAdded={() => setRefreshTrigger(prev => prev + 1)}
            />

            {/* Create Meeting Type Dialog */}
            <CreateMeetingTypeDialog
                isOpen={modals.createMeetingType.isOpen}
                onClose={modals.createMeetingType.close}
            />  
        </div>
    );
}; 