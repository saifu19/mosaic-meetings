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
import { Meeting } from '@/types';
import axios from 'axios';
import { useMeeting } from '@/components/MeetingContext/MeetingContext';


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
            url: `https://mojomosaic.live:8443/get-meeting-by-id?meeting_id=${meetingId}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.request(config);
        try {
            const targetMeeting: Meeting = {
                id: response.data[0],
                title: response.data[1],
                description: response.data[2],
                link: response.data[4],
                startTime: response.data[3],
                endTime: response.data[8] ? new Date(response.data[8]) : null,
                isJoined: response.data[5],
                agendaItems: response.data[8].map((item: string[]) => ({
                    id: item[0],
                    title: item[1],
                })),
                transcriptItems: response.data[7] || [],
                insights: response.data[9] || [],
                participants: response.data[10] || [],
                meetingType: response.data[6],
            }
            console.log(targetMeeting);
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
                        // dispatch({ type: 'START_MEETING', status: 'in_progress' });
                    } else {
                        localStopMeeting();
                        // dispatch({ type: 'END_MEETING', status: 'not_started' });
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
        console.log("start local func")
        const startTime = Date.now();
        localStorage.setItem('meetingStartTime', startTime.toString());
        dispatch({ type: 'START_MEETING', status: 'in_progress' });
    };

    const localStopMeeting = () => {
        console.log("end local func")
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

    // Utility Functions
    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

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
                            formatTime={formatTime}
                            onNavigate={handleNavigation}
                        />

                        <MeetingContent
                            meeting={selectedMeeting}
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
