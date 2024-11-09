import React from 'react';
import { AIInsightModal } from '@/components/AIInsightModal/AIInsightModal';
import { AIInsight, KanbanColumn, Meeting } from '@/types';

interface AIInsightModalWrapperProps {
    selectedInsight: AIInsight | null;
    selectedMeetingId: string | null;
    kanbanColumns: KanbanColumn[];
    setKanbanColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
    setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
    onClose: () => void;
}

export const AIInsightModalWrapper: React.FC<AIInsightModalWrapperProps> = ({
    selectedInsight,
    selectedMeetingId,
    kanbanColumns,
    setKanbanColumns,
    setMeetings,
    onClose,
}) => {
    const handleAddToKanban = (content: string) => {
        const firstColumn = kanbanColumns[0];
        if (firstColumn) {
            setKanbanColumns(prev => prev.map(col =>
                col.id === firstColumn.id
                    ? { ...col, items: [...col.items, { id: Date.now().toString(), content }] }
                    : col
            ));
        }
    };

    const handleAddChatMessage = (insightId: string, content: string) => {
        setMeetings(prev => prev.map(meeting => {
            if (meeting.id === selectedMeetingId) {
                return {
                    ...meeting,
                    insights: meeting.insights.map(insight => {
                        if (insight.id === insightId) {
                            return {
                                ...insight,
                                chatThread: [
                                    ...insight.chatThread,
                                    {
                                        id: Date.now().toString(),
                                        sender: 'User',
                                        content,
                                        timestamp: new Date().toISOString()
                                    }
                                ]
                            };
                        }
                        return insight;
                    })
                };
            }
            return meeting;
        }));
    };

    return (
        <AIInsightModal
            insight={selectedInsight}
            isOpen={!!selectedInsight}
            onClose={onClose}
            onAddToKanban={handleAddToKanban}
            onAddChatMessage={handleAddChatMessage}
        />
    );
}; 