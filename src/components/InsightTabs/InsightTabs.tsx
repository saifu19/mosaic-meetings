import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Meeting, TranscriptRange } from '@/types';
import { RangeContainer } from '@/components/RangeContainer/RangeContainer';

interface InsightTabsProps {
    meeting: Meeting | null;
    transcriptRanges: TranscriptRange[];
    onObserve: (element: HTMLDivElement) => void;
    onUnobserve: (element: HTMLDivElement) => void;
    agents: Array<{id: number, name: string, order: number}>;
}

export const InsightTabs = React.memo(({ meeting, transcriptRanges, onObserve, onUnobserve, agents }: InsightTabsProps) => {
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
                        meeting={meeting}
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
                                meeting={meeting}
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