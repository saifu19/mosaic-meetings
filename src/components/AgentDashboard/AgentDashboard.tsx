import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Calendar } from 'lucide-react';
import { Agent } from '@/types';
import { AgentCard } from '@/components/AgentCard/AgentCard'
import { CreateAgentDialog } from '@/components/CreateAgentDialog/CreateAgentDialog';
import { useModalStates } from '@/hooks/useModalStates';
import axios from 'axios';
import { config as cfg } from '@/config/env';
import { useNavigate } from 'react-router-dom';

export const AgentDashboard = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(undefined);
    const [editMode, setEditMode] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const modals = useModalStates();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await axios.get(`${cfg.apiUrl}/api/get-analysis-agents`);
                setAgents(response.data);
            } catch (error) {
                console.error('Error fetching agents:', error);
            }
        };

        fetchAgents();
    }, [refreshTrigger]);

    const onEditAgentClick = (agent: Agent) => {
        setSelectedAgent(agent);
        setEditMode(true);
        modals.addAgent.open();
    };

    const onDeleteAgentClick = async (agentId: string) => {
        if (window.confirm('Are you sure you want to delete this agent?')) {
            try {
                await axios.delete(`${cfg.apiUrl}/api/delete-analysis-agent/${agentId}`);
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                console.error('Error deleting agent:', error);
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="p-4" style={{ width: '100%' }}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">AI Agents Management</h1>
                    <div className="space-x-2">
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={modals.addAgent.open}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Agent
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
                            onClick={() => navigate('/meeting-types')}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Meeting Types Crud
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map(agent => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onEdit={() => onEditAgentClick(agent)}
                            onDelete={() => onDeleteAgentClick(agent.id)}
                        />
                    ))}
                </div>

                <CreateAgentDialog
                    isOpen={modals.addAgent.isOpen}
                    onClose={() => {
                        modals.addAgent.close();
                        setSelectedAgent(undefined);
                        setEditMode(false);
                    }}
                    onAgentUpdated={() => setRefreshTrigger(prev => prev + 1)}
                    mode={editMode ? 'edit' : 'add'}
                    initialData={selectedAgent}
                />
            </div>
        </div>
    );
};