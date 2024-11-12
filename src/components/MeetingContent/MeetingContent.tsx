import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgendaTimeline } from '@/components/AgendaTimeline/AgendaTimeline';
import { TranscriptView } from '@/components/TranscriptView/TranscriptView';
import { InsightsPanel } from '@/components/InsightsPanel/InsightsPanel';
import { Meeting, MeetingState, AIInsight } from '@/types';

interface MeetingContentProps {
    meeting: Meeting;
    meetingState: MeetingState;
    selectedMeetingId: string;
    dispatch: React.Dispatch<any>;
    selectedMeeting: Meeting | null;
    setSelectedMeeting: React.Dispatch<React.SetStateAction<Meeting | null>>;
    setSelectedInsight: (insight: AIInsight | null) => void;
}

export const MeetingContent: React.FC<MeetingContentProps> = ({
    meeting,
    meetingState,
    dispatch,
    selectedMeeting,
    setSelectedInsight,
    setSelectedMeeting,
}) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {meetingState.error && (
                <Alert variant="destructive" className="m-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{meetingState.error}</AlertDescription>
                </Alert>
            )}

            {/* Agenda Timeline */}
            <div className="bg-white shadow-md p-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Agenda</h3>
                <AgendaTimeline
                    meeting={meeting}
                    currentAgendaItemId={meeting?.agendaItems[meetingState.currentAgendaItemIndex]?.id || ''}
                    currentAgendaItemIndex={meetingState.currentAgendaItemIndex}
                    onAgendaItemChange={(itemId) => {
                        const newIndex = meeting?.agendaItems.findIndex(item => item.id === itemId) || 0;
                        dispatch({ type: 'SET_AGENDA_ITEM_INDEX', payload: newIndex });
                    }}
                    dispatch={dispatch}
                    selectedMeeting={selectedMeeting}
                    setSelectedMeeting={setSelectedMeeting}
                    isInProgress={meetingState.status === 'in_progress'}
                />
            </div>

            {/* Meeting Content */}
            <div className="flex-1 flex space-x-4 overflow-hidden p-4">
                {/* Transcript */}
                <div className="w-1/2 overflow-hidden flex flex-col">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Meeting Transcript</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto">
                            <TranscriptView
                                meeting={meeting}
                                currentAgendaItemIndex={meetingState.currentAgendaItemIndex}
                                onInsightClick={setSelectedInsight}
                                meetingState={meetingState}
                                transcriptItems={meeting.transcriptItems}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* AI Insights */}
                <div className="w-1/2 overflow-hidden flex flex-col">
                    <InsightsPanel
                        meeting={meeting}
                        currentAgendaItemIndex={meetingState.currentAgendaItemIndex}
                        onInsightSelect={setSelectedInsight}
                        onNewInsight={(newInsight) => {
                            setSelectedMeeting(selectedMeeting ? {
                                ...selectedMeeting,
                                insights: [...selectedMeeting.insights, newInsight]
                            } : null);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}; 