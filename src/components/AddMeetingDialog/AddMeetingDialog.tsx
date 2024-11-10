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
import axios from 'axios';

interface AddMeetingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
    onMeetingAdded: () => void;
}

export const AddMeetingDialog = ({
    isOpen,
    onClose,
    setMeetings,
    onMeetingAdded,
}: AddMeetingDialogProps) => {

    const [formData, setFormData] = React.useState<Partial<Meeting>>({
        title: '',
        description: '',
        link: '',
        startTime: null,
        participants: [],
    });

    const handleAddMeeting = async (formData: Partial<Meeting>) => {
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
            link: formData.link || '',
            isJoined: false,
        };
        const localDate = new Date(formData.startTime || Date.now());
        meetingToAdd.startTime = localDate;
        const formattedDate = localDate.getUTCFullYear() + '-' +
            String(localDate.getUTCMonth() + 1).padStart(2, '0') + '-' +
            String(localDate.getUTCDate()).padStart(2, '0') + ' ' +
            String(localDate.getUTCHours()).padStart(2, '0') + ':' +
            String(localDate.getUTCMinutes()).padStart(2, '0') + ':00'

        const meetingData = {
            meeting_title: meetingToAdd.title,
            meeting_agenda: meetingToAdd.description,
            meeting_link: meetingToAdd.link,
            meeting_time: formattedDate,
        }

        const config = {
            method: 'post',
            url: 'https://mojomosaic.live:8443/create-meeting',
            headers: {
                'Content-Type': 'application/json'
            },
            data: meetingData
        }

        await axios(config)


        setMeetings(prevMeetings => [...prevMeetings, meetingToAdd]);
    };

    const handleMeetingTypeChange = (type: MeetingType) => {
        setFormData(prev => ({
            ...prev,
            agendaItems: meetingTypes[type].defaultAgendaItems
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleAddMeeting(formData);
        setFormData({ title: '', description: '', participants: [], link: '' });
        onMeetingAdded();
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
                        <label>Meeting Date</label>
                        <Input
                            type="datetime-local"
                            value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, -5) : ''}
                            onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label>Meeting Link</label>
                        <Input
                            value={formData.link || ''}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
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