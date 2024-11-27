import { useEffect, useMemo, useRef, useState } from 'react';
import { TranscriptItem, AIInsight, Meeting, MeetingState } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { config as cfg } from '@/config/env';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface TranscriptViewProps {
    meeting: Meeting | null;
    currentAgendaItemIndex: number;
    onInsightClick: (insight: AIInsight) => void;
    meetingState: MeetingState;
    transcriptItems: any[];
    highlightRanges: { start: string; end: string }[];
    isFullScreen: boolean;
    onToggleFullScreen: () => void;
}

export const TranscriptView = ({
    meeting,
    currentAgendaItemIndex,
    // onInsightClick,
    meetingState,
    transcriptItems,
    highlightRanges,
    isFullScreen,
    onToggleFullScreen
}: TranscriptViewProps) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [localTranscriptItems, setLocalTranscriptItems] = useState<TranscriptItem[]>([]);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);
    const lastScrollTop = useRef<number>(0);

    const currentAgendaIndexRef = useRef(currentAgendaItemIndex);

    const isMessageHighlighted = (messageId: string) => {
        return highlightRanges.some(range => {
            const startId = parseInt(range.start);
            const endId = parseInt(range.end);
            const currentId = parseInt(messageId);
            return currentId >= startId && currentId <= endId;
        });
    };

    const handleScroll = () => {
        const element = contentRef.current;
        if (!element) return;

        const { scrollTop, scrollHeight, clientHeight } = element;
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

        // If user has scrolled up
        if (scrollTop < lastScrollTop.current) {
            setShouldAutoScroll(false);
        }

        // If user has scrolled to bottom
        if (isAtBottom) {
            setShouldAutoScroll(true);
        }

        lastScrollTop.current = scrollTop;
    };

    const allTranscriptItems = useMemo(() => {
        const meetingTranscripts = transcriptItems.map((item) => {
            return {
                id: item.id,
                message: item.message,
                speaker: ['John', 'Alice', 'Bob', 'Sarah'][Math.floor(Math.random() * 4)],
                timestamp: item.timestamp,
                agenda: item.agenda,
            }
        })

        return [...meetingTranscripts, ...localTranscriptItems]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [meeting, currentAgendaItemIndex, localTranscriptItems]);

    const currentAgendaItemId = useMemo(() => {
        const agendaItemId = meeting?.agendaItems?.[currentAgendaItemIndex]?.id;
        return agendaItemId;
    }, [meeting, currentAgendaItemIndex]);

    // Auto scroll to bottom of transcript
    useEffect(() => {
        if (shouldAutoScroll && contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [allTranscriptItems]);

    // Update current agenda item index ref
    useEffect(() => {
        currentAgendaIndexRef.current = currentAgendaItemIndex;
    }, [currentAgendaItemIndex]);

    // Handle WebSocket connection
    useEffect(() => {
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
            if (!meeting?.isJoined || meetingState.status !== 'in_progress') {
                return null;
            }

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
                    console.log('Received message:', data);
                    if (data.meeting_id === meeting?.id) {
                        const currentAgendaId = meeting.agendaItems[currentAgendaIndexRef.current]?.id || '';
                        const newTranscript: TranscriptItem = {
                            id: data.id,
                            speaker: ['John', 'Alice', 'Bob', 'Sarah'][Math.floor(Math.random() * 4)],
                            message: data.text,
                            timestamp: new Date().toLocaleTimeString(),
                            agenda: currentAgendaId || ''
                        };
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
            reconnectAttempts = MAX_RECONNECT_ATTEMPTS;
        };
    }, [meeting?.id, meeting?.isJoined, meetingState.status]);

    if (isFullScreen) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center max-w-[2000px] mx-auto w-full">
                        <CardTitle>Meeting Transcript</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleFullScreen}
                            className="hover:bg-gray-100"
                        >
                            <Minimize2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4" ref={contentRef} onScroll={handleScroll}>
                    <div className="max-w-[2000px] mx-auto space-y-4">
                        {allTranscriptItems
                            .filter(item => item.agenda === currentAgendaItemId)
                            .map((item) => (
                                <div key={item.id}
                                    className={cn(
                                        "p-4 rounded-lg shadow transition-colors duration-200",
                                        isMessageHighlighted(item.id)
                                            ? "bg-yellow-50 border-yellow-200 border"
                                            : "bg-white"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        {/* <span className="font-bold">{item.speaker}</span> */}
                                        <span className="text-sm text-gray-500">{item.timestamp}</span>
                                    </div>
                                    <p className="mt-2">{item.message}</p>
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
                </div>
            </div>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Meeting Transcript</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleFullScreen}
                        className="hover:bg-gray-100"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto" ref={contentRef} onScroll={handleScroll}>
                <div className="space-y-4">
                    {allTranscriptItems
                        .filter(item => item.agenda === currentAgendaItemId)
                        .map((item) => (
                            <div key={item.id}
                                className={cn(
                                    "p-4 rounded-lg shadow transition-colors duration-200",
                                    isMessageHighlighted(item.id)
                                        ? "bg-yellow-50 border-yellow-200 border"
                                        : "bg-white"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    {/* <span className="font-bold">{item.speaker}</span> */}
                                    <span className="text-sm text-gray-500">{item.timestamp}</span>
                                </div>
                                <p className="mt-2">{item.message}</p>
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
    );
};