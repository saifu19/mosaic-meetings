import React from 'react';
import { AIInsight } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getInsightIcon, getInsightColor } from '@/utils/insightFormatters';
import { Button } from '../ui/button';
import { ArrowRightIcon } from 'lucide-react';

interface InsightCardProps {
    insight: AIInsight;
    type: string;
    formattedContent: string;
    originalContent: string;
    onRef?: (element: HTMLDivElement | null) => void;
    rangeStart?: string;
    rangeEnd?: string;
}

export const InsightCard = React.memo(({ 
    insight, 
    type, 
    formattedContent,
    originalContent,
    onRef,
    rangeStart,
    rangeEnd 
}: InsightCardProps) => {
    const onInstantPresentation = async () => {
        try {
            const response = await fetch('https://www.mojomosaic.xyz/api/v1/create-subtopic-and-quick-ppt', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer be086981-630f-4a1a-8c47-712a9e128e55'
                },
                body: JSON.stringify({
                    content: originalContent,
                    meeting_id: 19,
                    type: type,
                    timestamp: insight.created_at
                })
            });
            console.log(response);
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
                    <Button variant="outline" onClick={onInstantPresentation}>
                        <ArrowRightIcon className="w-4 h-4" />
                        Instant Presentation
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
});

InsightCard.displayName = 'InsightCard';