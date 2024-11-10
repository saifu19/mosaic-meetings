import { useCallback } from 'react';
import { Meeting } from '@/types';
import axios from 'axios'


interface UseMeetingActionsProps {
    selectedMeeting: Meeting | null;
    setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
    dispatch: React.Dispatch<any>;
}

export const useMeetingActions = ({
    // const [isJoined, setIsJoined] = useState(false),
	// const [isJoining, setIsJoining] = useState(false),
	// const [isEnding, setIsEnding] = useState(false),
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

            let data = JSON.stringify({
                "url": selectedMeeting.link,
                "meeting_id": selectedMeeting.id
            });

            console.log("Link : ",selectedMeeting.link)

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://mojomosaic.live:8443/start-meeting',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios.request(config)
			.then((response) => {
				console.log(JSON.stringify(response.data));
				// setIsJoined(true)
				// if (updateJoinedStatus) {
				// 	updateJoinedStatus(true)
				// }
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				// setIsJoining(false)
				// if (onRefresh) {
				// 	onRefresh()
				// }
			});
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
    
            axios.request(config)
                .then((response) => {
                    console.log(JSON.stringify(response.data));
                    // if (updateJoinedStatus) {
                    //     updateJoinedStatus(false)
                    // }
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    // setIsEnding(false);
                    // if (onRefresh) {
                    //     onRefresh()
                    // }
                });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to end meeting' });
        }
    }, [selectedMeeting, dispatch, setMeetings]);

    return { startMeeting, stopMeeting };
}; 