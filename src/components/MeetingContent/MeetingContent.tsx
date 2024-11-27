import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AgendaTimeline } from '@/components/AgendaTimeline/AgendaTimeline';
import { TranscriptView } from '@/components/TranscriptView/TranscriptView';
import { InsightsPanel } from '@/components/InsightsPanel/InsightsPanel';
import { Meeting, MeetingState, AIInsight } from '@/types';
import axios from 'axios';
import { config as cfg } from '@/config/env';

interface MeetingContentProps {
    meetingState: MeetingState;
    selectedMeetingId: string;
    dispatch: React.Dispatch<any>;
    selectedMeeting: Meeting | null;
    setSelectedMeeting: React.Dispatch<React.SetStateAction<Meeting | null>>;
    setSelectedInsight: (insight: AIInsight | null) => void;
}

export const MeetingContent: React.FC<MeetingContentProps> = ({
    meetingState,
    dispatch,
    selectedMeeting,
    setSelectedInsight,
    setSelectedMeeting,
}) => {
    const [visibleInsightRanges, setVisibleInsightRanges] = useState<{
        start: string;
        end: string;
    }[]>([]);

    const [isInsightsPanelFullScreen, setIsInsightsPanelFullScreen] = useState(false);
    const [isTranscriptFullScreen, setIsTranscriptFullScreen] = useState(false);
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
                    currentAgendaItemId={selectedMeeting?.agendaItems[meetingState.currentAgendaItemIndex]?.id || ''}
                    currentAgendaItemIndex={meetingState.currentAgendaItemIndex}
                    onAgendaItemChange={async (itemId) => {
                        let data = JSON.stringify({
                            "agenda_id": itemId
                        });

                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: `${cfg.apiUrl}/api/update-agenda-id`,
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
                    meeting={selectedMeeting}
                    currentAgendaItemIndex={meetingState.currentAgendaItemIndex}
                    onInsightClick={setSelectedInsight}
                    meetingState={meetingState}
                    transcriptItems={selectedMeeting?.transcriptItems || []}
                    highlightRanges={visibleInsightRanges}
                    isFullScreen={isTranscriptFullScreen}
                    onToggleFullScreen={() => setIsTranscriptFullScreen(!isTranscriptFullScreen)}
                />

                {/* AI Insights */}
                <div className={`overflow-hidden flex flex-col`}>
                    <InsightsPanel
                        meeting={selectedMeeting}
                        currentAgendaItemIndex={meetingState.currentAgendaItemIndex}
                        // onInsightSelect={setSelectedInsight}
                        meetingState={meetingState}
                        onVisibleRangesChange={setVisibleInsightRanges}
                        isFullScreen={isInsightsPanelFullScreen}
                        onToggleFullScreen={() => setIsInsightsPanelFullScreen(!isInsightsPanelFullScreen)}
                    />
                </div>
            </div>
        </div>
    );
}; 