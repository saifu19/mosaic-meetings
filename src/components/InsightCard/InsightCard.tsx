import React, { useEffect } from 'react';
import { AIInsight, Meeting } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getInsightIcon, getInsightColor } from '@/utils/insightFormatters';
import { Button } from '../ui/button';
import { ArrowRightIcon } from 'lucide-react';

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
    useEffect(() => {
        console.log('insight', insight.id);
        if (parseInt(insight?.id) === 1004) {
            console.log('insight', insight);
        }
    }, [insight]);
    const onInstantPresentation = async () => {
        try {
            console.log('meeting', meeting);
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
                    {insight?.course_url ? (
                        <Button variant="outline" onClick={() => window.open(insight.course_url, '_blank')}>
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