import { MeetingType, /* Agent */} from '@/types';
import { Card, CardHeader, CardTitle, CardContent, /* CardFooter */ } from '@/components/ui/card';

interface MeetingTypeCardProps {
    meetingType: MeetingType;
    onEdit: () => void;
}

export const MeetingTypeCard = ({ meetingType, /* onEdit */ }: MeetingTypeCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-start">
                    <span>{meetingType.name}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-4">{meetingType.description}</p>
                
                {meetingType.agents && meetingType.agents.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Assigned Agents:</h4>
                        <div className="space-y-1">
                            {meetingType.agents
                                .sort((a, b) => a.order - b.order)
                                .map((agent) => (
                                    <div 
                                        key={agent.id} 
                                        className="text-sm text-gray-600 flex items-center"
                                    >
                                        <span className="w-6">{agent.order}.</span>
                                        <span>{agent.name}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {meetingType.defaultAgendaItems && (
                    <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Agenda Template:</h4>
                        <div className="text-sm text-gray-600">
                            {meetingType.defaultAgendaItems.map((item, index) => (
                                <div key={index} className="pl-4">• {item.title}</div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            {/* <CardFooter className="flex justify-end space-x-2 mt-auto">
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>
            </CardFooter> */}
        </Card>
    );
}; 