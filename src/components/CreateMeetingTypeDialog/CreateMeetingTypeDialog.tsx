import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Agent } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GripVertical, Plus, X } from 'lucide-react';
import axios from 'axios';
import { config as cfg } from '@/config/env';

interface CreateMeetingTypeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onMeetingTypeUpdated: () => void;
    initialData?: any;
    mode: 'add' | 'edit';
    availableAgents: Agent[];
}

export const CreateMeetingTypeDialog = ({
    isOpen,
    onClose,
    onMeetingTypeUpdated,
    initialData,
    mode,
    availableAgents,
}: CreateMeetingTypeDialogProps) => {
    const [formData, setFormData] = useState({
        id: 0,
        meeting_type: '',
        description: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [agendaItems, setAgendaItems] = useState<Array<{ title: string; }>>([
        { title: '' }
    ]);

    const [selectedAgents, setSelectedAgents] = useState<Array<Agent & { order: number }>>([]);
    const [unselectedAgents, setUnselectedAgents] = useState<Agent[]>([]);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({ ...initialData, meeting_type: initialData.name });
            setAgendaItems(initialData.agenda_items || [{ title: '' }]);
            fetchExistingAgents(initialData.id);
        } else {
            setFormData({ id: 0, meeting_type: '', description: '' });
            setAgendaItems([{ title: '' }]);
            setSelectedAgents([]);
        }
        updateUnselectedAgents(availableAgents, []);
    }, [mode, initialData, isOpen, availableAgents]);

    const updateUnselectedAgents = (allAgents: Agent[], selected: Array<Agent & { order: number }>) => {
        const selectedIds = new Set(selected.map(agent => agent.id));
        setUnselectedAgents(allAgents.filter(agent => !selectedIds.has(agent.id)));
    };

    const fetchExistingAgents = async (meetingTypeId: number) => {
        try {
            const response = await axios.get(`${cfg.apiUrl}/api/get-meeting-type-agents?meeting_type_id=${meetingTypeId}`);
            const orderedAgents = response.data.map((agent: any) => ({
                ...agent,
                order: agent.order,
            }));
            setSelectedAgents(orderedAgents);
            updateUnselectedAgents(availableAgents, orderedAgents);
        } catch (error) {
            console.error('Error fetching meeting type agents:', error);
        }
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(selectedAgents);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order numbers
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        setSelectedAgents(updatedItems);
    };

    const handleAddAgent = (agentId: string) => {
        const agent = unselectedAgents.find(a => a.id.toString() === agentId);
        if (agent) {
            const newAgent = {
                ...agent,
                order: selectedAgents.length + 1
            };
            setSelectedAgents([...selectedAgents, newAgent]);
            updateUnselectedAgents(availableAgents, [...selectedAgents, newAgent]);
        }
    };

    const handleRemoveAgent = (agentId: string) => {
        const updatedAgents = selectedAgents
            .filter(agent => agent.id !== agentId)
            .map((agent, index) => ({ ...agent, order: index + 1 }));
        setSelectedAgents(updatedAgents);
        updateUnselectedAgents(availableAgents, updatedAgents);
    };

    const handleAddAgendaItem = () => {
        setAgendaItems([...agendaItems, { title: '' }]);
    };

    const handleRemoveAgendaItem = (index: number) => {
        setAgendaItems(agendaItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Format agenda items into array of strings
            const agenda_items = agendaItems
                .filter(item => item.title.trim())
                .map(item => item.title);
    
            // First create/update the meeting type
            if (mode === 'add') {
                const meetingTypeResponse = await axios.post(
                    `${cfg.apiUrl}/api/create-meeting-type`,
                    {
                        meeting_type: formData.meeting_type,
                        description: formData.description,
                        agenda_items: agenda_items
                    }
                );
        
                const meetingTypeId = meetingTypeResponse.data.id;
                
                const data = {
                    meeting_type: meetingTypeId,
                    agent: selectedAgents.map((agent) => agent.id),
                }

                console.log(data);

                // Then create agent assignments
                await axios.post(`${cfg.apiUrl}/api/create-meeting-type-agents`, data);
            }
    
            onMeetingTypeUpdated();
            onClose();
        } catch (error) {
            console.error('Error submitting:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Create New Meeting Type' : 'Edit Meeting Type'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'edit' && (
                        <Input
                            type="hidden"
                            value={formData.id}
                        />
                    )}
                    <div className="space-y-2">
                        <label>Title</label>
                        <Input
                            value={formData.meeting_type}
                            onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                            placeholder="e.g., Sprint Planning"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label>Description</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="A meeting to define the Sprint Goal and select Product Backlog Items for the Sprint"
                            required
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label>Agenda Items</label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddAgendaItem}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {agendaItems.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={item.title}
                                        onChange={(e) => {
                                            const newItems = [...agendaItems];
                                            newItems[index].title = e.target.value;
                                            setAgendaItems(newItems);
                                        }}
                                        placeholder="Agenda item title"
                                        className="flex-grow"
                                    />
                                    {agendaItems.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveAgendaItem(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label>Assigned Agents</label>
                        {unselectedAgents.length > 0 && (
                            <Select onValueChange={handleAddAgent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Add an agent..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {unselectedAgents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id.toString()}>
                                            {agent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="agents">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-2 mt-2"
                                    >
                                        {selectedAgents.map((agent, index) => (
                                            <Draggable
                                                key={agent.id}
                                                draggableId={agent.id.toString()}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="flex items-center justify-between p-2 border rounded"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <GripVertical className="h-4 w-4" />
                                                            <span>{agent.order}. {agent.name}</span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveAgent(agent.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Submitting...' : (mode === 'add' ? 'Create Meeting Type' : 'Update Meeting Type')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};