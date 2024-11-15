import React, { useEffect, useState } from 'react';
import { Meeting, MeetingType, AgendaItem } from '@/types';
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
import axios from 'axios';
import { Loader2 } from 'lucide-react';

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
    const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<Meeting>>({
        title: '',
        description: '',
        link: '',
        meetingType: '',
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
                meetingType: '',
            });
        } else if (mode === 'edit' && initialData) {
            setFormData({
                ...initialData,
                startTime: initialData.startTime ? new Date(initialData.startTime) : null,
            });
        }

        fetchMeetingTypes();
    }, [isOpen, mode, initialData]);

    const fetchMeetingTypes = async () => {
        const response = await axios.get('https://mojomosaic.live:8443/get-meeting-types');
        const meetingTypes: MeetingType[] = response.data.map((type: any) => ({
            key: type[0],
            title: type[1],
        }));
        setMeetingTypes(meetingTypes);
    }

    const handleAddMeeting = async (formData: Partial<Meeting>) => {
        const localDate = new Date(formData.startTime || Date.now());

        const formattedDate = localDate.getUTCFullYear() + '-' +
            String(localDate.getUTCMonth() + 1).padStart(2, '0') + '-' +
            String(localDate.getUTCDate()).padStart(2, '0') + ' ' +
            String(localDate.getUTCHours()).padStart(2, '0') + ':' +
            String(localDate.getUTCMinutes()).padStart(2, '0') + ':00'

        const meetingData = {
            meeting_title: formData.title,
            meeting_agenda: formData.description,
            meeting_link: formData.link,
            meeting_time: formattedDate,
            meeting_type_id: formData.meetingType,
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
                meeting_link: formData.link,
                meeting_type_id: formData.meetingType
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

    const handleMeetingTypeChange = (typeKey: string) => {
        const selectedType = meetingTypes.find(type => type.key === typeKey);
        if (selectedType) {
            setFormData(prev => ({
                ...prev,
                meetingType: typeKey,
                agendaItems: getDefaultAgendaItems(typeKey)
            }));
        }
    };

    const getDefaultAgendaItems = (typeKey: string) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://mojomosaic.live:8443/get-agenda-items?meeting_type_id=${typeKey}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        let defaultAgendaItems: AgendaItem[] = []
        axios.request(config)
            .then((response) => {
                defaultAgendaItems = response.data.map((item: any) => ({
                    id: item[0],
                    title: item[1],
                    duration: 90,
                }));
            })
            .catch((error) => {
                console.log(error);
            });

        return defaultAgendaItems || [];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setIsSubmitting(true);
            if (mode === 'add') {
                await handleAddMeeting(formData);
            } else {
                await handleEditMeeting(formData);
            }
            setFormData({ title: '', description: '', participants: [], link: '', meetingType: '' });
            onMeetingUpdated();
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
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
                            value={formData.meetingType || 'Select meeting type'}
                            onValueChange={handleMeetingTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue>
                                    {meetingTypes.find(type => type.key === formData.meetingType)?.title || "Select meeting type"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {meetingTypes.map((type: MeetingType) => (
                                    <SelectItem key={type.key} value={type.key}>
                                        {type.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {mode === 'add' ? 'Create Meeting' : 'Update Meeting'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
};