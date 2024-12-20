import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { QrCode, Loader2, Play, X } from 'lucide-react';
import { Meeting, MeetingState } from '@/types';
import { Clock } from '@/components/ui/icons/clock';
import axios from 'axios';
import { config as cfg } from '@/config/env';

interface MeetingSidebarProps {
    meeting: Meeting;
    meetingState: MeetingState;
    meetingDuration: number;
    onStartMeeting: () => void;
    onStopMeeting: () => void;
    onShowQRCode: () => void;
    onNavigate: (path: string) => void;
    // onBack: () => void;
}

export const MeetingSidebar: React.FC<MeetingSidebarProps> = ({
    meeting,
    meetingState,
    meetingDuration,
    onStartMeeting,
    onStopMeeting,
    onShowQRCode,
    onNavigate,
}) => {
    const [joinDisabled, setJoinDisabled] = useState(true);

    const updateJoinDisabled = async () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${cfg.apiUrl}/api/get-joined-meetings`,
            headers: {}
        };

        const response = await axios.request(config);
        const isValidMeetingPlatform = meeting.link?.toLowerCase().includes('teams') ||
            meeting.link?.toLowerCase().includes('zoom');
        if (response.data === '' && isValidMeetingPlatform) {
            setJoinDisabled(false);
        }
    }

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        updateJoinDisabled();
    }, [meeting.link]);

    return (
        <div className="w-64 bg-white shadow-md p-4 flex flex-col">
            <h2 className="text-xl font-bold mb-4">{meeting.title}</h2>
            <p className="text-gray-600 mb-4">{meeting.description}</p>
            <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-semibold">{formatTime(meetingDuration)}</span>
            </div>
            {(meetingState.status === 'not_started' || !meeting.isJoined) ? (
                <Button
                    onClick={onStartMeeting}
                    disabled={meetingState.isLoading || joinDisabled}
                    className="mb-4 bg-green-500 hover:bg-green-600 text-white"
                    aria-busy={meetingState.isLoading}
                    aria-label="Start meeting"
                >
                    {meetingState.isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Play className="mr-2 h-4 w-4" />
                    )}
                    Start Meeting
                </Button>
            ) : (
                <Button
                    onClick={onStopMeeting}
                    variant="destructive"
                    disabled={meetingState.isLoading}
                    className="mb-4"
                    aria-busy={meetingState.isLoading}
                    aria-label="End meeting"
                >
                    {meetingState.isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <X className="mr-2 h-4 w-4" />
                    )}
                    End Meeting
                </Button>
            )}
            <h3 className="font-semibold mb-2">Participants</h3>
            <ScrollArea className="flex-grow">
                {meeting.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center mb-2">
                        <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{participant.name}</span>
                    </div>
                ))}
            </ScrollArea>
            <Button onClick={onShowQRCode} variant="outline" className="mt-4">
                <QrCode className="mr-2 h-4 w-4" />
                Show QR Code
            </Button>
            <Button onClick={() => onNavigate('/')} variant="ghost" className="mt-2">
                Back to Meetings
            </Button>
        </div>
    );
}; 