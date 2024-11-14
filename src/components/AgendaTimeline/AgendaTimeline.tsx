import React from 'react';
import { Meeting } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface AgendaTimelineProps {
    meeting: Meeting;
    currentAgendaItemId: string;
    currentAgendaItemIndex: number;
    onAgendaItemChange: (itemId: string) => void;
    selectedMeeting: Meeting | null;
    setSelectedMeeting: React.Dispatch<React.SetStateAction<Meeting | null>>;
    dispatch: React.Dispatch<any>;
    isInProgress?: boolean;
}

export const AgendaTimeline = ({
    meeting,
    currentAgendaItemId,
    currentAgendaItemIndex,
    onAgendaItemChange,
    selectedMeeting,
    setSelectedMeeting,
    dispatch,
    isInProgress = false,
}: AgendaTimelineProps) => {
    const handleMoveToNext = () => {
        const nextIndex = currentAgendaItemIndex + 1;
        if (nextIndex >= meeting.agendaItems.length) return;

        setSelectedMeeting(selectedMeeting ? {
            ...selectedMeeting,
            agendaItems: selectedMeeting.agendaItems.map((item, index) =>
                index === nextIndex ? { ...item, status: 'in_progress' } : item
            )
        } : null);

        // Update current agenda item index
        dispatch({ type: 'NEXT_AGENDA_ITEM' });
        onAgendaItemChange(meeting.agendaItems[nextIndex].id);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {meeting.agendaItems.map((item) => (
                    <div
                        key={item.id}
                        className={`p-2 rounded-lg flex-1 ${
                            item.id === currentAgendaItemId
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                        }`}
                        data-id={item.id}
                        style={{
                            flexBasis: `${98 / meeting.agendaItems.length}%`,
                            maxWidth: `${98 / meeting.agendaItems.length}%`,
                        }}
                    >
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            {/* <p className="text-sm">{formatTime(item.duration)}</p> */}
                            {/* <p className="text-sm text-muted-foreground">Status: {item.status}</p> */}
                        </div>
                    </div>
                ))}
            </div>
            {isInProgress && currentAgendaItemIndex < meeting.agendaItems.length - 1 && (
                <Button 
                    onClick={handleMoveToNext}
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Next Agenda Item
                </Button>
            )}
        </div>
    );
};