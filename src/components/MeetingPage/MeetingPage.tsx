import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MeetingSidebar } from '@/components/MeetingSidebar/MeetingSidebar';
import { MeetingContent } from '@/components/MeetingContent/MeetingContent';
import { AIInsightModalWrapper } from '@/components/AIInsightModalWrapper/AIInsightModalWrapper';
import { QRCodeModal } from '@/components/QRCodeModal/QRCodeModal';
import useMeetingTimer from '@/hooks/useMeetingTimer';
import { useModalStates } from '@/hooks/useModalStates';
import { useMeetingActions } from '@/hooks/useMeetingActions';
import { AgendaItem, AIInsight, Meeting, TranscriptItem } from '@/types';
import axios from 'axios';
import { useMeeting } from '@/components/MeetingContext/MeetingContext';
import { config as cfg } from '@/config/env';


export const MeetingPage = () => {
    const { meetingId } = useParams();
    const { meetingState, dispatch } = useMeeting();
    const meetingDuration = useMeetingTimer(meetingState.status === 'in_progress');
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const navigate = useNavigate();
    const modals = useModalStates();

    const fetchMeetingById = async (meetingId: string): Promise<Meeting | null> => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${cfg.apiUrl}/api/get-meeting-by-id?meeting_id=${meetingId}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.request(config);
        try {
            const targetMeeting: Meeting = {
                id: response.data.meeting.id,
                title: response.data.meeting.title,
                description: response.data.meeting.agenda,
                link: response.data.meeting.link,
                startTime: response.data.meeting.time,
                endTime: null,
                isJoined: response.data.meeting.is_joined,
                agendaItems: response.data.agenda_items.map((item: Partial<AgendaItem>) => ({
                    id: item.id ? item.id : null,
                    title: item.title ? item.title : null,
                })),
                transcriptItems: response.data.transcripts.map((item: Partial<TranscriptItem>) => ({
                    id: item.id ? item.id : null,
                    message: item.message ? item.message : null,
                    timestamp: item.timestamp ? item.timestamp : null,
                    agenda: item.agenda ? item.agenda : null,
                })),
                insights: response.data.transcript_insights.map((item: Partial<AIInsight>) => ({
                    id: item.id ? item.id : null,
                    insight_type: item.insight_type ? item.insight_type : null,
                    insight: item.insight ? item.insight : null,
                    created_at: item.created_at ? new Date(item.created_at).toLocaleString() : null,
                    agenda: item.agenda ? item.agenda : null,
                    start_transcript: item.start_transcript ? item.start_transcript : null,
                    end_transcript: item.end_transcript ? item.end_transcript : null,
                })),
                participants: [],
                meetingType: response.data.meeting.meeting_type,
            }
            return targetMeeting;
        } catch (error) {
            console.error('Error fetching the specific meeting:', error);
            return null;
        }
    };

    useEffect(() => {
        const loadMeetingById = async () => {
            try {
                const meeting = await fetchMeetingById(String(meetingId));
                if (meeting) {
                    setSelectedMeeting(meeting);
                    if (meeting.isJoined) {
                        localStartMeeting();

                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            url: `${cfg.apiUrl}/api/get-agenda-id`,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                
                        const response = await axios.request(config);

                        if(response.data.agenda_id !== null) {
                            const currentAgendaItemId = response.data.agenda_id;
                            const currentAgendaItemIndex = meeting.agendaItems.findIndex(item => item.id === currentAgendaItemId);
                            dispatch({ type: 'SET_AGENDA_ITEM_INDEX', payload: currentAgendaItemIndex });
                        }
                    } else {
                        localStopMeeting();
                    }
                } else {
                    setSelectedMeeting(null);
                }
            } catch (error) {
                console.error('Error fetching the specific meeting:', error);
                setSelectedMeeting(null);
            }
        };

        loadMeetingById();
    }, [meetingId]);

    const handleNavigation = useCallback((path: string) => {
        if (meetingState.status === 'in_progress' || selectedMeeting?.isJoined) {
            const confirmNavigation = window.confirm('Meeting is in progress. Are you sure you want to leave?');
            if (!confirmNavigation) {
                return;
            }
        }
        navigate(path);
    }, [meetingState.status, selectedMeeting?.isJoined, navigate]);

    const { startMeeting, stopMeeting } = useMeetingActions({
        selectedMeeting,
        setSelectedMeeting,
        dispatch,
    });

    const localStartMeeting = () => {
        const startTime = Date.now();
        localStorage.setItem('meetingStartTime', startTime.toString());
        dispatch({ type: 'START_MEETING', status: 'in_progress' });
    };

    const localStopMeeting = () => {
        localStorage.removeItem('meetingStartTime');
        dispatch({ type: 'END_MEETING', status: 'not_started' });
    };

    const handleStartMeeting = async () => {
        dispatch({ type: 'SET_LOADING', isLoading: true });
        try {
            await startMeeting();
            localStartMeeting();
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false });
        }
    };

    const handleStopMeeting = async () => {
        dispatch({ type: 'SET_LOADING', isLoading: true });
        try {
            await stopMeeting();
            localStopMeeting();
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false });
        }
    };

    useEffect(() => {
        // Push initial state to enable popstate handling
        window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    
        const handlePopState = async () => {
            if (meetingState.status === 'in_progress' || selectedMeeting?.isJoined) {
                const confirmNavigation = window.confirm('Meeting is in progress. Are you sure you want to leave?');
                if (!confirmNavigation) {
                    window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
                    return;
                }
            }
        };
    
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (meetingState.status === 'in_progress' || selectedMeeting?.isJoined) {
                const message = 'Meeting is in progress. Changes you made may not be saved.';
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };
    
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [meetingState.status, selectedMeeting?.isJoined, handleStopMeeting]);

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-gray-100">
                <div>{ }</div>
                {selectedMeeting && (
                    <>
                        <MeetingSidebar
                            meeting={selectedMeeting}
                            meetingState={meetingState}
                            meetingDuration={meetingDuration}
                            onStartMeeting={handleStartMeeting}
                            onStopMeeting={handleStopMeeting}
                            onShowQRCode={modals.qrCode.open}
                            onNavigate={handleNavigation}
                        />

                        <MeetingContent
                            meetingState={meetingState}
                            selectedMeetingId={selectedMeeting.id || ''}
                            dispatch={dispatch}
                            selectedMeeting={selectedMeeting}
                            setSelectedMeeting={setSelectedMeeting}
                            setSelectedInsight={modals.insight.select}
                        />
                    </>
                )}

                {modals.insight.selected && (
                    <AIInsightModalWrapper
                        selectedInsight={modals.insight.selected}
                        selectedMeetingId={selectedMeeting?.id ?? null}
                        onClose={modals.insight.close} kanbanColumns={[]} setKanbanColumns={function (): void {
                            throw new Error('Function not implemented.');
                        }} setMeetings={function (): void {
                            throw new Error('Function not implemented.');
                        }} />
                )}

                {modals.qrCode.isOpen && (
                    <QRCodeModal
                        isOpen={modals.qrCode.isOpen}
                        onClose={modals.qrCode.close}
                    />
                )}
            </div>
        </TooltipProvider>
    );
}
