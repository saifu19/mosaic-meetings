import { Agent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface AgentCardProps {
    agent: Agent;
    onEdit: () => void;
    onDelete: () => void;
}

export const AgentCard = ({ agent, onEdit, onDelete }: AgentCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-start">
                    <span>{agent.name}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                <div className="space-y-2">
                    <div>
                        <h4 className="font-semibold text-sm">System Prompt:</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">{agent.system_prompt}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Human Prompt:</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">{agent.human_prompt}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 mt-auto">
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
};