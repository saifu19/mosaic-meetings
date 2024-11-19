import { useEffect, useMemo, useState } from 'react';
import { TranscriptItem, AIInsight, Meeting, MeetingState } from '@/types';
// import { Brain } from 'lucide-react';
// Remove these imports
// import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { config as cfg } from '@/config/env';

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
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [localTranscriptItems, setLocalTranscriptItems] = useState<TranscriptItem[]>([]);

    const allTranscriptItems = useMemo(() => {
        const meetingTranscripts = transcriptItems.map((item) => {
            return {
                id: item.id,
                content: item.content,
                speaker: ['John', 'Alice', 'Bob', 'Sarah'][Math.floor(Math.random() * 4)],
                timestamp: item.timestamp,
                agendaItemId: item.agendaItemId,
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
        console.log('allTranscriptItems', allTranscriptItems)

        if (!meeting?.id || !meeting.isJoined || meetingState.status !== 'in_progress') {
            if (socket) {
                console.log('Closing WebSocket due to meeting state change');
                socket.close();
                setSocket(null);
            }
            return;
        }
    
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;
        const RECONNECT_DELAY = 2000;
    
        function connect() {
            console.log('Initializing WebSocket connection for meeting:', meeting?.id);
            
            // Use secure WebSocket protocol and the correct port
            const wsUrl = `${cfg.wsUrl}/ws/transcription/?meeting_id=${meeting?.id}`;
            console.log('Connecting to:', wsUrl);
            
            const newSocket = new WebSocket(wsUrl);
    
            newSocket.onopen = () => {
                console.log('WebSocket Connected ✅');
                reconnectAttempts = 0;
                setSocket(newSocket);
            };
    
            newSocket.onerror = (error) => {
                console.error('WebSocket Connection Error ❌:', error);
                // Don't set socket to null here, wait for onclose
            };
    
            newSocket.onclose = (event) => {
                console.log('WebSocket Disconnected ⚠️:', event.reason);
                setSocket(null);
    
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    console.log(`Attempting to reconnect... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                    setTimeout(connect, RECONNECT_DELAY);
                } else {
                    console.log('Max reconnection attempts reached');
                }
            };
    
            newSocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Raw transcription data received:', data);
                    
                    if (data.meeting_id === meeting?.id) {
                        const newTranscript: TranscriptItem = {
                            id: Date.now().toString(),
                            speaker: ['John', 'Alice', 'Bob', 'Sarah'][Math.floor(Math.random() * 4)],
                            content: data.text,
                            timestamp: new Date().toLocaleTimeString(),
                            agendaItemId: currentAgendaItemId || ''
                        };
                        console.log('New Transcript Created 📝:', newTranscript);
                        setLocalTranscriptItems(prev => [...prev, newTranscript]);
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            };
    
            return newSocket;
        }
    
        const newSocket = connect();
    
        return () => {
            console.log('Cleaning up WebSocket connection');
            if (newSocket) {
                newSocket.close();
                setSocket(null);
            }
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