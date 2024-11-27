import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { TranscriptRange } from '@/types';
import { RangeContainer } from '@/components/RangeContainer/RangeContainer';

interface InsightTabsProps {
    transcriptRanges: TranscriptRange[];
    onObserve: (element: HTMLDivElement) => void;
    onUnobserve: (element: HTMLDivElement) => void;
}

export const InsightTabs = React.memo(({ transcriptRanges, onObserve, onUnobserve }: InsightTabsProps) => {
    return (
        <Tabs defaultValue="all">
            <TabsList>
                <TabsTrigger value="all">All Insights</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
                <TabsTrigger value="action_items">Action Items</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
                {transcriptRanges.map((range) => (
                    <RangeContainer 
                        key={`${range.start}-${range.end}`} 
                        range={range}
                        onObserve={onObserve}
                        onUnobserve={onUnobserve}
                    />
                ))}
            </TabsContent>

            {['requirements', 'context', 'action_items', 'summary'].map(type => (
                <TabsContent key={type} value={type}>
                    {transcriptRanges.map((range) => (
                        range.insights[type as keyof typeof range.insights].length > 0 && (
                            <RangeContainer 
                                key={`${range.start}-${range.end}-${type}`}
                                range={{
                                    ...range,
                                    insights: {
                                        requirements: [],
                                        context: [],
                                        action_items: [],
                                        summary: [],
                                        [type]: range.insights[type as keyof typeof range.insights]
                                    }
                                }}
                                onObserve={onObserve}
                                onUnobserve={onUnobserve}
                            />
                        )
                    ))}
                </TabsContent>
            ))}
        </Tabs>
    );
});

InsightTabs.displayName = 'InsightTabs';