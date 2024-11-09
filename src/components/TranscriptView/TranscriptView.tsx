import { useCallback, useEffect, useMemo } from 'react';
import { TranscriptItem, AIInsight, Meeting } from '@/types';
import { Brain } from 'lucide-react';

interface TranscriptViewProps {
    meeting: Meeting | null;
    currentAgendaItemIndex: number;
    onInsightClick: (insight: AIInsight) => void;
    isSimulationEnabled?: boolean;
    onNewTranscript: (transcripts: TranscriptItem[]) => void;
}

export const TranscriptView = ({
    meeting,
    currentAgendaItemIndex,
    onInsightClick,
    isSimulationEnabled = false,
    onNewTranscript
}: TranscriptViewProps) => {
    const currentTranscriptItems = useMemo(() => {
        if (!meeting?.agendaItems?.[currentAgendaItemIndex]) return [];
        return meeting.transcriptItems.filter(
            item => item.agendaItemId === meeting.agendaItems[currentAgendaItemIndex].id
        );
    }, [meeting, currentAgendaItemIndex]);

    const currentAgendaItemId = meeting?.agendaItems?.[currentAgendaItemIndex]?.id;

    const generateTranscriptContent = useCallback(() => {
        const phrases = [
            "I think we should focus on the key deliverables.",
            "Can we discuss the timeline for this?",
            "What are the main blockers we're facing?",
            "Let's align on the next steps.",
            "I have some concerns about the resource allocation.",
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        const simulateTranscript = () => {
            if (!currentAgendaItemId) return;
            if (Math.random() > 0.5) {
                const newTranscript: TranscriptItem = {
                    id: Date.now().toString(),
                    speaker: ['John', 'Alice', 'Bob', 'Sarah'][Math.floor(Math.random() * 4)],
                    content: generateTranscriptContent(),
                    timestamp: new Date().toLocaleTimeString(),
                    agendaItemId: currentAgendaItemId
                };
                onNewTranscript([newTranscript]);
            }
        };

        if (isSimulationEnabled && currentAgendaItemId) {
            simulateTranscript(); // Initial simulation
            timer = setInterval(simulateTranscript, 5000); // Every 5 seconds
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isSimulationEnabled, currentAgendaItemId, onNewTranscript, generateTranscriptContent]);

    return (
        <div className="space-y-4">
            {currentTranscriptItems.map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <span className="font-bold">{item.speaker}</span>
                        <span className="text-sm text-gray-500">{item.timestamp}</span>
                    </div>
                    <p className="mt-2">{item.content}</p>
                    {item.aiInsight && (
                        <div
                            className="mt-2 p-2 bg-purple-50 rounded flex items-center space-x-2 cursor-pointer hover:bg-purple-100"
                            onClick={() => onInsightClick(item.aiInsight!)}
                        >
                            <Brain className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-purple-700">AI Insight Available</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};