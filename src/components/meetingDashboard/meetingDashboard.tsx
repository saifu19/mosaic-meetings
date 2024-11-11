// MeetingDashboard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MeetingsAndKanbanView } from '@/components/MeetingsAndKanbanView/MeetingsAndKanbanView';
import { KanbanColumn } from '@/types';
import { initialKanbanColumns } from '@/data/mockData';


function meetingDashboard() {
    
    const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(initialKanbanColumns);

    const navigate = useNavigate();

    const onMeetingSelect = (id: string) => {
        navigate(`/meeting/${id}`);
    };

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-gray-100">
                <MeetingsAndKanbanView
                    kanbanColumns={kanbanColumns}
                    setKanbanColumns={setKanbanColumns}
                    onMeetingSelect={onMeetingSelect}
                />
            </div>
        </TooltipProvider>
    );
}

export default meetingDashboard;
