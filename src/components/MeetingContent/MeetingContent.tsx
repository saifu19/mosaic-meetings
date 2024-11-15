import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AgendaTimeline } from '@/components/AgendaTimeline/AgendaTimeline';
import { TranscriptView } from '@/components/TranscriptView/TranscriptView';
import { InsightsPanel } from '@/components/InsightsPanel/InsightsPanel';
import { Meeting, MeetingState, AIInsight } from '@/types';
import axios from 'axios';

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
                    onAgendaItemChange={async (itemId) => {
                        let data = JSON.stringify({
                            "agenda_id": itemId
                        });

                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: 'https://mojomosaic.live:8443/update-agenda-id',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: data
                        };

                        await axios.request(config)
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
                <TranscriptView
                    meeting={meeting}
                    currentAgendaItemIndex={meetingState.currentAgendaItemIndex}
                    onInsightClick={setSelectedInsight}
                    meetingState={meetingState}
                    transcriptItems={meeting.transcriptItems}
                />

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