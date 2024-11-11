import React, { useEffect, useState } from 'react';
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

interface MeetingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onMeetingUpdated: () => void;
    initialData?: Meeting;
    mode: 'add' | 'edit';
}

export const MeetingDialog = ({
    isOpen,
    onClose,
    onMeetingUpdated,
    initialData,
    mode,
}: MeetingDialogProps) => {

    const [formData, setFormData] = useState<Partial<Meeting>>({
        title: '',
        description: '',
        link: '',
        startTime: null,
        participants: [],
    });

    useEffect(() => {
        if (!isOpen || mode === 'add') {
            setFormData({
                title: '',
                description: '',
                link: '',
                startTime: null,
                participants: [],
            });
        } else if (mode === 'edit' && initialData) {
            setFormData({
                ...initialData,
                startTime: initialData.startTime ? new Date(initialData.startTime) : null,
            });
        }
    }, [isOpen, mode, initialData]);

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


        // setMeetings(prevMeetings => [...prevMeetings, meetingToAdd]);
    };

    const handleEditMeeting = async (formData: Partial<Meeting>) => {
		try {
			const localDate = new Date(formData.startTime || Date.now())
			const formattedDate = localDate.getUTCFullYear() + '-' +
				String(localDate.getUTCMonth() + 1).padStart(2, '0') + '-' +
				String(localDate.getUTCDate()).padStart(2, '0') + ' ' +
				String(localDate.getUTCHours()).padStart(2, '0') + ':' +
				String(localDate.getUTCMinutes()).padStart(2, '0') + ':00'

			const data = {
				meeting_id: initialData?.id,
				meeting_title: formData.title,
				meeting_time: formattedDate,
				meeting_agenda: formData.description,
				meeting_link: formData.link
			}

			await axios({
				method: 'POST',
				url: 'https://mojomosaic.live:8443/update-meeting',
				headers: { 'Content-Type': 'application/json' },
				data: data
			})

			// setMeetings(prevMeetings => prevMeetings.map(meeting => meeting.id === initialData?.id ? { ...meeting, ...formData } : meeting));
		} catch (error) {
			console.error('Error updating meeting:', error)
		}
	}

    const handleMeetingTypeChange = (type: MeetingType) => {
        setFormData(prev => ({
            ...prev,
            agendaItems: meetingTypes[type].defaultAgendaItems
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'add') {
            await handleAddMeeting(formData);
        } else {
            await handleEditMeeting(formData);
        }
        setFormData({ title: '', description: '', participants: [], link: '' });
        onMeetingUpdated();
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
                        <Button type="submit">
                            {mode === 'add' ? 'Create Meeting' : 'Update Meeting'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};