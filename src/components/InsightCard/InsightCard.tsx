import React, { useState } from 'react';
import { AIInsight, Meeting } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getInsightIcon, getInsightColor } from '@/utils/insightFormatters';
import { Button } from '../ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { config as cfg } from '@/config/env';

interface InsightCardProps {
    meeting: Meeting | null;
    insight: AIInsight;
    type: string;
    formattedContent: string;
    originalContent: string;
    onRef?: (element: HTMLDivElement | null) => void;
    rangeStart?: string;
    rangeEnd?: string;
}

export const InsightCard = React.memo(({
    meeting,
    insight,
    type,
    formattedContent,
    originalContent,
    onRef,
    rangeStart,
    rangeEnd
}: InsightCardProps) => {
    const [courseUrl, setCourseUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onInstantPresentation = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://mojomosaic.xyz/api/v1/create-subtopic-and-quick-ppt', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer be086981-630f-4a1a-8c47-712a9e128e55'
                },
                body: JSON.stringify({
                    config: {
                        site_id: meeting?.site_id || 0,
                        ssa: meeting?.ssa || 0
                    },
                    data: {
                        meeting_id: meeting?.id,
                        insight_id: parseInt(insight.id),
                        content: originalContent
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Presentation created:', data);

            // If response is successful, connect to WebSocket
            if (response.status === 200) {
                const socket = new WebSocket(`${cfg.wsUrl}/ws/insight-course/${parseInt(insight.id)}/`);

                socket.onopen = () => {
                    console.log('WebSocket Connected for course URL');
                };

                socket.onmessage = (event) => {
                    try {
                        let messageData = JSON.parse(event.data);
                        messageData = messageData.data;
                        console.log('messageData', messageData);
                        if (messageData.insight_id && messageData.course_url) {
                            setCourseUrl(messageData.course_url);
                            socket.close();
                        }
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    } finally {
                        setIsLoading(false);
                    }
                };

                socket.onerror = (error) => {
                    console.error('WebSocket Error:', error);
                };

                socket.onclose = () => {
                    console.log('WebSocket Closed');
                };
            }
        } catch (error) {
            console.error('Error sending presentation data:', error);
        }
    }

    return (
        <Card
            className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
            ref={onRef}
            data-start={rangeStart}
            data-end={rangeEnd}
            data-type={type}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className={cn('p-2 rounded-full', getInsightColor(type))}>
                        {getInsightIcon(type)}
                    </div>
                    <CardDescription>{insight.created_at}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {formattedContent ? (
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formattedContent }}
                    />
                ) : (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                )}
                <div className="flex items-center justify-end">
                    {isLoading ? (
                        <Button variant="outline" disabled>
                            <ArrowRightIcon className="w-4 h-4" />
                            Generating Presentation...
                        </Button>
                    ) : courseUrl || insight?.course_url ? (
                        <Button
                            variant="outline"
                            onClick={() => window.open(courseUrl || insight.course_url, '_blank')}
                        >
                            <ArrowRightIcon className="w-4 h-4" />
                            View Presentation
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={onInstantPresentation}>
                            <ArrowRightIcon className="w-4 h-4" />
                            Instant Presentation
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

InsightCard.displayName = 'InsightCard';