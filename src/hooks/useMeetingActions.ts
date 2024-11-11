import { useCallback } from 'react';
import { Meeting } from '@/types';

interface UseMeetingActionsProps {
    selectedMeeting: Meeting | null;
    setSelectedMeeting: React.Dispatch<React.SetStateAction<Meeting | null>>;
    dispatch: React.Dispatch<any>;
}

export const useMeetingActions = ({
    selectedMeeting,
    setSelectedMeeting,
    dispatch
}: UseMeetingActionsProps) => {
    const startMeeting = useCallback(async () => {
        if (!selectedMeeting) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch({ type: 'START_MEETING' });
            setSelectedMeeting({
                ...selectedMeeting, 
                agendaItems: selectedMeeting.agendaItems.map((item, index) =>
                    index === 0 ? { ...item, status: 'in_progress' } : item
                )
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to start meeting' });
        }
    }, [selectedMeeting, dispatch, setSelectedMeeting]);

    const stopMeeting = useCallback(async () => {
        if (!selectedMeeting) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch({ type: 'END_MEETING' });
            setSelectedMeeting({
                ...selectedMeeting,
                endTime: new Date()
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to end meeting' });
        }
    }, [selectedMeeting, dispatch, setSelectedMeeting]);

    return { startMeeting, stopMeeting };
}; 