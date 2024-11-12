// import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Pencil } from 'lucide-react';
import { Meeting } from "@/types"
import { Button } from "../ui/button";

interface MeetingCardProps {
    meeting: Meeting
    onEditMeetingClick: (meeting: Meeting) => void
}

export const MeetingCard = ({
    meeting,
    onEditMeetingClick
}: MeetingCardProps) => {
    const navigate = useNavigate()

    const onMeetingSelect = (id: string) => {
        navigate(`/meeting/${id}`);
    };
    return (
        <Card
            key={meeting.id}
            className="cursor-pointer"
            onClick={() => onMeetingSelect(meeting.id)}
        >
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{meeting.title}</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();  // Prevent card click event
                            onEditMeetingClick(meeting);
                        }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
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