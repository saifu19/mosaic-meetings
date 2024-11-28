import { useState, useEffect } from 'react';
import { Agent } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { config as cfg } from '@/config/env';

interface CreateAgentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAgentUpdated: () => void;
    initialData?: Agent;
    mode: 'add' | 'edit';
}

export const CreateAgentDialog = ({
    isOpen,
    onClose,
    onAgentUpdated,
    initialData,
    mode,
}: CreateAgentDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<Agent>>({
        name: '',
        description: '',
        system_prompt: '',
        human_prompt: '',
    });

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                description: '',
                system_prompt: '',
                human_prompt: '',
            });
        }
    }, [mode, initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (mode === 'add') {
                await axios.post(`${cfg.apiUrl}/api/create-analysis-agent`, formData);
            } else {
                await axios.post(`${cfg.apiUrl}/api/update-analysis-agent`, formData);
            }
            onAgentUpdated();
            onClose();
        } catch (error) {
            console.error('Error submitting agent:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Create New Agent' : 'Edit Agent'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {mode === 'edit' && (
                        <Input
                            type='hidden'
                            value={formData.id}
                        />
                    )}

                    <div className="space-y-2">
                        <label>Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label>Description</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <label>System Prompt</label>
                        <Textarea
                            value={formData.system_prompt}
                            onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                            required
                            rows={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <label>Human Prompt</label>
                        <Textarea
                            value={formData.human_prompt}
                            onChange={(e) => setFormData({ ...formData, human_prompt: e.target.value })}
                            required
                            rows={5}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'add' ? 'Create Agent' : 'Update Agent'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 