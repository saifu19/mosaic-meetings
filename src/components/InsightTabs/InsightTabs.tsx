import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { TranscriptRange } from '@/types';
import { RangeContainer } from '@/components/RangeContainer/RangeContainer';

interface InsightTabsProps {
    transcriptRanges: TranscriptRange[];
    onObserve: (element: HTMLDivElement) => void;
    onUnobserve: (element: HTMLDivElement) => void;
    agents: Array<{id: number, name: string, order: number}>;
}

export const InsightTabs = React.memo(({ transcriptRanges, onObserve, onUnobserve, agents }: InsightTabsProps) => {
    return (
        <Tabs defaultValue="all">
            <TabsList>
                <TabsTrigger value="all">All Insights</TabsTrigger>
                {agents.map(agent => (
                    <TabsTrigger key={agent.id} value={agent.name}>
                        {agent.name.replace('_', ' ')}
                    </TabsTrigger>
                ))}
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

            {agents.map(agent => (
                <TabsContent key={agent.id} value={agent.name}>
                    {transcriptRanges.map((range) => (
                        range.insights[agent.name]?.length > 0 && (
                            <RangeContainer 
                                key={`${range.start}-${range.end}-${agent.name}`}
                                range={{
                                    ...range,
                                    insights: {
                                        [agent.name]: range.insights[agent.name] || []
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