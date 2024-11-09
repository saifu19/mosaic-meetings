import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIInsight } from '@/types';

interface AIInsightModalProps {
    insight: AIInsight | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToKanban: (content: string) => void;
    onAddChatMessage: (insightId: string, content: string) => void;
}

export const AIInsightModal = ({
    insight,
    isOpen,
    onClose,
    onAddToKanban,
    onAddChatMessage,
}: AIInsightModalProps) => {
    const [newMessage, setNewMessage] = useState('');

    if (!insight) return null;

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            onAddChatMessage(insight.id, newMessage);
            setNewMessage('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>AI Insight - {insight.type}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>{insight.content}</p>

                    <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                        {insight.chatThread.map((message) => (
                            <div key={message.id} className="mb-2">
                                <span className="font-bold">{message.sender}: </span>
                                <span>{message.content}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex space-x-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                        />
                        <Button onClick={handleSendMessage}>Send</Button>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onAddToKanban(insight.content);
                                onClose();
                            }}
                        >
                            Add to Kanban
                        </Button>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};