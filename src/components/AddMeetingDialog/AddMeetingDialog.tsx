import React from 'react';
import { Meeting, MeetingType } from '@/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { meetingTypes } from '@/data/mockData';

interface AddMeetingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
}

export const AddMeetingDialog = ({
    isOpen,
    onClose,
    setMeetings,
}: AddMeetingDialogProps) => {

    const [formData, setFormData] = React.useState<Partial<Meeting>>({
        title: '',
        description: '',
        participants: [],
    });

    const handleAddMeeting = (formData: Partial<Meeting>) => {
        const meetingToAdd: Meeting = {
            id: Date.now().toString(),
            title: formData.title || '',
            description: formData.description || '',
            startTime: null,
            endTime: null,
            agendaItems: formData.agendaItems || [],
            participants: [],
            transcriptItems: [],
            insights: [],
        };
        setMeetings(prevMeetings => [...prevMeetings, meetingToAdd]);
    };

    const handleMeetingTypeChange = (type: MeetingType) => {
        setFormData(prev => ({
            ...prev,
            agendaItems: meetingTypes[type].defaultAgendaItems
        }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddMeeting(formData);
        setFormData({ title: '', description: '', participants: [] });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Meeting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label>Title</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label>Description</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label>Meeting Type</label>
                        <Select
                            onValueChange={handleMeetingTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select meeting type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(meetingTypes).map(([key, type]) => (
                                    <SelectItem key={key} value={key}>
                                        {type.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Create Meeting</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};