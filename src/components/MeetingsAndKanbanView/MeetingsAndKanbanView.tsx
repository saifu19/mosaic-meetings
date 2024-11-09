import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { KanbanBoard } from '@/components/KanbanBoard/KanbanBoard';
import { Meeting, KanbanColumn } from '@/types';

interface MeetingsAndKanbanViewProps {
    meetings: Meeting[];
    kanbanColumns: KanbanColumn[];
    setKanbanColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
    onMeetingSelect: (id: string) => void;
    onAddMeetingClick: () => void;
    onCreateMeetingTypeClick: () => void;
}

export const MeetingsAndKanbanView: React.FC<MeetingsAndKanbanViewProps> = ({
    meetings,
    kanbanColumns,
    setKanbanColumns,
    onMeetingSelect,
    onAddMeetingClick,
    onCreateMeetingTypeClick,
}) => {
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">MojoMosaic Meeting Facilitator</h1>
                <div className="space-x-2">
                    <Button
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={onAddMeetingClick}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Meeting
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onCreateMeetingTypeClick}
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
                        {meetings.filter(m => !m.endTime).map(meeting => (
                            <Card 
                                key={meeting.id} 
                                className="cursor-pointer" 
                                onClick={() => onMeetingSelect(meeting.id)}
                            >
                                <CardHeader>
                                    <CardTitle>{meeting.title}</CardTitle>
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
                        {meetings.filter(m => m.endTime).map(meeting => (
                            <Card key={meeting.id}>
                                <CardHeader>
                                    <CardTitle>{meeting.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{meeting.description}</p>
                                    <div className="mt-2 flex items-center">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        <span>{new Date(meeting.endTime!).toLocaleString()}</span>
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
        </div>
    );
}; 