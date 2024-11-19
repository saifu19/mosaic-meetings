// import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Pencil } from 'lucide-react';
import { Meeting } from "@/types"
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface MeetingCardProps {
    meeting: Partial<Meeting>
    onEditMeetingClick: (meeting: Partial<Meeting>) => void
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
            onClick={() => onMeetingSelect(meeting.id || '')}
        >
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center space-x-2 whitespace-nowrap">
                        <span className="truncate mr-2">{meeting.title}</span>
                        {Boolean(meeting.isJoined) && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="relative flex h-3 w-3 flex-shrink-0 bg-transparent">
                                            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                                            <div className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Active</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </CardTitle>
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