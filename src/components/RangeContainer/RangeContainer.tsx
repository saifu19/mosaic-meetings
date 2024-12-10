import React, { useEffect, useRef } from 'react';
import { AIInsight, Meeting, TranscriptRange } from '@/types';
import { InsightCard } from '@/components/InsightCard/InsightCard';
import { formatInsightContent } from '@/utils/insightFormatters';

interface RangeContainerProps {
    meeting: Meeting | null;
    range: TranscriptRange;
    onObserve?: (element: HTMLDivElement) => void;
    onUnobserve?: (element: HTMLDivElement) => void;
}

export const RangeContainer = React.memo(({ meeting, range, onObserve, onUnobserve }: RangeContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (element && onObserve) {
            onObserve(element);
            return () => {
                if (onUnobserve) {
                    onUnobserve(element);
                }
            };
        }
    }, [onObserve, onUnobserve]);

    const handleCardRef = (element: HTMLDivElement | null) => {
        if (element && onObserve) {
            onObserve(element);
        }
    };

    return (
        <div
            ref={containerRef}
            className="mb-6 border-b pb-4"
            data-start={range.start}
            data-end={range.end}
        >
            <div className="text-sm text-gray-500 mb-2">
                Transcript Range: {range.start} - {range.end}
            </div>
            {Object.entries(range.insights).map(([type, insights]) => (
                insights && insights.length > 0 && (
                    <div key={type} className="insight-group">
                        <h3 className="font-semibold mb-2 capitalize">
                            {type.replace('_', ' ').toUpperCase()}
                        </h3>
                        <div className="insight-cards">
                            {insights.map((insight: AIInsight) => (
                                <InsightCard
                                    meeting={meeting}
                                    key={insight.id}
                                    insight={insight}
                                    type={type}
                                    formattedContent={formatInsightContent(insight.insight)}
                                    originalContent={insight.insight}
                                    onRef={handleCardRef}
                                    rangeStart={range.start}
                                    rangeEnd={range.end}
                                />
                            ))}
                        </div>
                    </div>
                )
            ))}
        </div>
    );
});

RangeContainer.displayName = 'RangeContainer';