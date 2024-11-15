import { useCallback } from 'react';
import { Meeting } from '@/types';
import axios from 'axios';

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
        dispatch({ type: 'SET_LOADING', payload: true, isLoading: true });
        try {
            let data = JSON.stringify({
                "url": selectedMeeting.link,
                "meeting_id": selectedMeeting.id,
                "agenda_id": selectedMeeting.agendaItems[0].id
            });
            console.log(data)
            
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://mojomosaic.live:8443/start-meeting',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            await axios.request(config);
            
            dispatch({ type: 'START_MEETING', status: 'in_progress', isLoading: false });
            dispatch({ type: 'SET_AGENDA_ITEM_INDEX', payload: 0 });
            setSelectedMeeting({
                ...selectedMeeting, 
                isJoined: true,
                agendaItems: selectedMeeting.agendaItems.map((item, index) =>
                    index === 0 ? { ...item, status: 'in_progress' } : item
                )
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to start meeting' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [selectedMeeting, dispatch, setSelectedMeeting]);

    const stopMeeting = useCallback(async () => {
        if (!selectedMeeting) return;
        dispatch({ type: 'SET_LOADING', payload: true, isLoading: true });
        try {
            let data = JSON.stringify({
                "callback_url": "https://api.mojomosaic.xyz/transcript/54"
            });
    
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://mojomosaic.live:8443/end-meeting',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };
            console.log("everything is fine till now");
            await axios.request(config);
            dispatch({ type: 'END_MEETING', status: 'not_started', isLoading: false });
            setSelectedMeeting({
                ...selectedMeeting,
                isJoined: false,
                endTime: new Date()
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to end meeting' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }

    }, [selectedMeeting, dispatch, setSelectedMeeting]);

    return { startMeeting, stopMeeting };
};