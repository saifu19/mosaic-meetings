import { useCallback } from 'react';
import { Meeting } from '@/types';

interface UseMeetingActionsProps {
    selectedMeeting: Meeting | null;
    setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
    dispatch: React.Dispatch<any>;
}

export const useMeetingActions = ({
    selectedMeeting,
    setMeetings,
    dispatch
}: UseMeetingActionsProps) => {
    const startMeeting = useCallback(async () => {
        if (!selectedMeeting) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch({ type: 'START_MEETING' });
            setMeetings(prevMeetings => prevMeetings.map(meeting =>
                meeting.id === selectedMeeting.id
                    ? {
                        ...meeting,
                        startTime: new Date(),
                        agendaItems: meeting.agendaItems.map((item, index) =>
                            index === 0 ? { ...item, status: 'in_progress' } : item
                        )
                    }
                    : meeting
            ));
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to start meeting' });
        }
    }, [selectedMeeting, dispatch, setMeetings]);

    const stopMeeting = useCallback(async () => {
        if (!selectedMeeting) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch({ type: 'END_MEETING' });
            setMeetings(prevMeetings => prevMeetings.map(meeting =>
                meeting.id === selectedMeeting.id
                    ? { ...meeting, endTime: new Date() }
                    : meeting
            ));
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to end meeting' });
        }
    }, [selectedMeeting, dispatch, setMeetings]);

    return { startMeeting, stopMeeting };
}; 