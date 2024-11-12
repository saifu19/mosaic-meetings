import { createContext, useContext, useReducer, useState } from 'react';
import { Meeting, MeetingState } from '@/types';
import { meetingReducer } from '@/reducers/meetingReducer';

interface MeetingContextType {
    meeting: Meeting | null;
    meetingState: MeetingState;
    dispatch: React.Dispatch<any>;
    setMeeting: (meeting: Meeting | null) => void;
}

const MeetingContext = createContext<MeetingContextType | null>(null);

export const MeetingProvider = ({ children }: { children: React.ReactNode }) => {
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [meetingState, dispatch] = useReducer(meetingReducer, {
        status: 'not_started',
        duration: 0,
        currentAgendaItemIndex: 0,
        error: null,
        isLoading: false,
    });

    return (
        <MeetingContext.Provider value={{ meeting, meetingState, dispatch, setMeeting }}>
            {children}
        </MeetingContext.Provider>
    );
};

export const useMeeting = () => {
    const context = useContext(MeetingContext);
    if (!context) throw new Error('useMeeting must be used within MeetingProvider');
    return context;
}; 