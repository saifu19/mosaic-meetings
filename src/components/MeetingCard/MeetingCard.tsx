// import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Meeting } from "@/types"

interface MeetingCardProps {
    meeting: Meeting
}

export const MeetingCard = ({
    meeting
}: MeetingCardProps) => {
    const navigate = useNavigate()

    const onMeetingSelect = (id: string) => {
        navigate(`/meeting/${id}`);
    };
    return (
        <Card key={meeting.id} className='cursor-pointer' onClick={() => onMeetingSelect(meeting.id)}>
            <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{meeting.description}</p>
                <div className="mt-2 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                        {meeting.startTime ? new Date(meeting.startTime).toLocaleString() : 'Not started'}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}