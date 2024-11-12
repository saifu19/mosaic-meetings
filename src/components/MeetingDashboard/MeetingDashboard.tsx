import { TooltipProvider } from '@/components/ui/tooltip';
import { MeetingsAndKanbanView } from '@/components/MeetingsAndKanbanView/MeetingsAndKanbanView';

export const MeetingDashboard = () => {
    
    return (
        <TooltipProvider>
            <div className="flex h-screen bg-gray-100">
                <MeetingsAndKanbanView/>
            </div>
        </TooltipProvider>
    );
}
