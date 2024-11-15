import { useEffect, useMemo, useState } from 'react';
import { TranscriptItem, AIInsight, Meeting, MeetingState } from '@/types';
// import { Brain } from 'lucide-react';
import io from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TranscriptViewProps {
    meeting: Meeting | null;
    currentAgendaItemIndex: number;
    onInsightClick: (insight: AIInsight) => void;
    meetingState: MeetingState;
    transcriptItems: any[];
}

export const TranscriptView = ({
    meeting,
    currentAgendaItemIndex,
    // onInsightClick,
    meetingState,
    transcriptItems
}: TranscriptViewProps) => {
    const [socket, setSocket] = useState<any>(null);
    const [localTranscriptItems, setLocalTranscriptItems] = useState<TranscriptItem[]>([]);

    const allTranscriptItems = useMemo(() => {
        const meetingTranscripts = transcriptItems.map((item) => {
            return {
                id: item[0],
                content: item[1],
                speaker: ['John', 'Alice', 'Bob', 'Sarah'][Math.floor(Math.random() * 4)],
                timestamp: item[2],
                agendaItemId: item[4],
            }
        })

        return [...meetingTranscripts, ...localTranscriptItems]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [meeting, currentAgendaItemIndex, localTranscriptItems]);

    const currentAgendaItemId = useMemo(() => {
        const agendaItemId = meeting?.agendaItems?.[currentAgendaItemIndex]?.id;
        return agendaItemId;
    }, [meeting, currentAgendaItemIndex]);

    useEffect(() => {
        if (!meeting?.id || !meeting.isJoined || meetingState.status !== 'in_progress') {
            if (socket) {
                console.log('Disconnecting socket due to meeting state change');
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        console.log('Initializing socket connection for meeting:', meeting.id);

        const newSocket = io('https://mojomosaic.live:8443', {
            transports: ['websocket', 'polling'],
            path: '/socket.io/',
            secure: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('Socket Connected ✅ - ID:', newSocket.id);
            setSocket(newSocket);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket Connection Error ❌:', error);
            setSocket(null);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket Disconnected ⚠️:', reason);
            setSocket(null);
        });

        newSocket.on('transcription', (data: any) => {
            console.log('Raw transcription data received:', data);
            if (data.meeting_id === meeting.id) {
                const newTranscript: TranscriptItem = {
                    id: Date.now().toString(),
                    speaker: ['John', 'Alice', 'Bob', 'Sarah'][Math.floor(Math.random() * 4)],
                    content: data.text,
                    timestamp: new Date().toLocaleTimeString(),
                    agendaItemId: currentAgendaItemId || ''
                };
                console.log('New Transcript Created 📝:', newTranscript);
                setLocalTranscriptItems(prev => [...prev, newTranscript]);
            } else {
                console.log('Meeting ID mismatch, transcript ignored ❌');
            }
        });

        // Cleanup
        return () => {
            console.log('Cleaning up socket connection');
            newSocket.disconnect();
            setSocket(null);
        };
    }, [meeting?.id, meeting?.isJoined, meetingState.status, currentAgendaItemId]);

    return (
        <div className="w-1/2 overflow-hidden flex flex-col">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Meeting Transcript</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <div className="space-y-4">
                        {allTranscriptItems
                            .filter(item => item.agendaItemId === currentAgendaItemId)
                            .map((item) => (
                                <div key={item.id} className="p-4 bg-white rounded-lg shadow">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold">{item.speaker}</span>
                                        <span className="text-sm text-gray-500">{item.timestamp}</span>
                                    </div>
                                    <p className="mt-2">{item.content}</p>
                                    {/* {item.aiInsight && (
                                        <div
                                            className="mt-2 p-2 bg-purple-50 rounded flex items-center space-x-2 cursor-pointer hover:bg-purple-100"
                                            onClick={() => onInsightClick(item.aiInsight!)}
                                        >
                                            <Brain className="h-4 w-4 text-purple-500" />
                                            <span className="text-sm text-purple-700">AI Insight Available</span>
                                        </div>
                                    )} */}
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};