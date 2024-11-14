import React from 'react';
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
import axios from 'axios';

interface CreateMeetingTypeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateMeetingTypeDialog = ({
    isOpen,
    onClose
}: CreateMeetingTypeDialogProps) => {
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        agendaTemplate: '',
    });

    const handleCreateMeetingType = (formData: {
        title: string;
        description: string;
        agendaTemplate: string;
    }) => {
        const defaultAgendaItems: Object[] = formData.agendaTemplate
            .split('\n')
            .filter(Boolean)
            .map((item) => (item));
        console.log(defaultAgendaItems);

        let data = JSON.stringify({
            "meeting_type": formData.title,
            "description": formData.description,
            "agenda_items": defaultAgendaItems,
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://mojomosaic.live:8443/create-meeting-type',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleCreateMeetingType(formData);
        setFormData({ title: '', description: '', agendaTemplate: '' });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Meeting Type</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-2">
                        <label>Title</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                            rows={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <label>Agenda Template (one item per line)</label>
                        <Textarea
                            value={formData.agendaTemplate}
                            onChange={(e) => setFormData({ ...formData, agendaTemplate: e.target.value })}
                            placeholder="Sprint Goals&#10;Backlog Review&#10;Capacity Planning"
                            required
                            rows={5}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Create Type</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};