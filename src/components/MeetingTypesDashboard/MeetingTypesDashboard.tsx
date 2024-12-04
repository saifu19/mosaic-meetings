import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar } from 'lucide-react';
import { MeetingType, Agent } from '@/types';
import { MeetingTypeCard } from '@/components/MeetingTypeCard/MeetingTypeCard';
import { CreateMeetingTypeDialog } from '@/components/CreateMeetingTypeDialog/CreateMeetingTypeDialog';
import { useModalStates } from '@/hooks/useModalStates';
import axios from 'axios';
import { config as cfg } from '@/config/env';
import { useNavigate } from 'react-router-dom';

export const MeetingTypesDashboard = () => {
    const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedMeetingType, setSelectedMeetingType] = useState<MeetingType | undefined>(undefined);
    const [editMode, setEditMode] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const modals = useModalStates();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchMeetingTypes = async () => {
            try {
                const response = await axios.get(`${cfg.apiUrl}/api/get-meeting-types`);
                setMeetingTypes(response.data);
            } catch (error) {
                console.error('Error fetching meeting types:', error);
            }
        };

        const fetchAgents = async () => {
            try {
                const response = await axios.get(`${cfg.apiUrl}/api/get-analysis-agents`);
                setAgents(response.data);
            } catch (error) {
                console.error('Error fetching agents:', error);
            }
        };

        fetchMeetingTypes();
        fetchAgents();
    }, [refreshTrigger]);

    const onEditMeetingTypeClick = (meetingType: MeetingType) => {
        setSelectedMeetingType(meetingType);
        setEditMode(true);
        modals.createMeetingType.open();
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="p-4" style={{ width: '100%' }}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Meeting Types Management</h1>
                    <div className="space-x-2">
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={modals.createMeetingType.open}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Meeting Type
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Meetings Dashboard
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/agents')}
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Agents Crud
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meetingTypes.map(meetingType => (
                        <MeetingTypeCard
                            key={meetingType.id}
                            meetingType={meetingType}
                            onEdit={() => onEditMeetingTypeClick(meetingType)}
                        />
                    ))}
                </div>

                <CreateMeetingTypeDialog
                    isOpen={modals.createMeetingType.isOpen}
                    onClose={() => {
                        modals.createMeetingType.close();
                        setSelectedMeetingType(undefined);
                        setEditMode(false);
                    }}
                    onMeetingTypeUpdated={() => setRefreshTrigger(prev => prev + 1)}
                    mode={editMode ? 'edit' : 'add'}
                    initialData={selectedMeetingType}
                    availableAgents={agents}
                />
            </div>
        </div>
    );
}; 