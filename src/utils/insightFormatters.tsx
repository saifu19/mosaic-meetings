import { AIInsight, InsightType } from '@/types';
import { Brain, Lightbulb, Flag } from 'lucide-react';

export const getInsightIcon = (type: InsightType) => {
    switch (type) {
        case 'requirements':
            return <Brain className="h-5 w-5" />;
        case 'context':
            return <Lightbulb className="h-5 w-5" />;
        case 'action_items':
        case 'summary':
            return <Flag className="h-5 w-5" />;
    }
};

export const getInsightColor = (type: InsightType) => {
    switch (type) {
        case 'requirements':
            return 'text-purple-500 bg-purple-50';
        case 'context':
            return 'text-yellow-500 bg-yellow-50';
        case 'action_items':
            return 'text-blue-500 bg-blue-50';
        case 'summary':
            return 'text-green-500 bg-green-50';
    }
};

export const isValidJSON = (str: string): boolean => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}; 

export const formatInsightContent = (insight: AIInsight) => {
    if (!insight.insight) return '';

    try {
        let content = insight.insight;
        // Remove outer quotes if they exist
        content = content.replace(/^"(.*)"$/, '$1')
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .trim();

        if (typeof content === 'object') {
            content = JSON.stringify(content);
        }

        switch (insight.insight_type) {
            case 'context':
                if (!isValidJSON(content)) {
                    return <div className="whitespace-pre-wrap">{content}</div>;
                }
                const contextData = JSON.parse(content);
                return (
                    <div className="space-y-2">
                        <div className="font-medium">
                            Current Topic: {contextData?.current_topic?.length > 0 ? contextData.current_topic : 'No current topic found'}
                        </div>

                        <div>
                            <div className="font-medium">Related Topics:</div>
                            {Array.isArray(contextData?.related_topics) && contextData.related_topics.length > 0 ? (
                                contextData.related_topics.map((topic: string, i: number) => (
                                    <div key={i} className="ml-4">• {topic}</div>
                                ))
                            ) : (
                                <div>{contextData.related_topics === "" ? 'No related topics found' : contextData.related_topics}</div>
                            )}
                        </div>

                        <div>
                            <div className="font-medium">Discussion Progress:</div>
                            {Array.isArray(contextData?.discussion_progress) && contextData.discussion_progress.length > 0 ? (
                                contextData.discussion_progress.map((progress: any, i: number) => (
                                    <div key={i} className="ml-4">
                                        • {typeof progress === 'object' ? progress.description || progress.step : progress}
                                    </div>
                                ))
                            ) : (
                                <div>No discussion progress available</div>
                            )}
                        </div>
                    </div>
                );

            case 'action_items':
                if (!isValidJSON(content)) {
                    return <div className="whitespace-pre-wrap">{content}</div>;
                }
                const actionData = JSON.parse(content);
                const items = Array.isArray(actionData?.action_items) ? actionData.action_items :
                    Array.isArray(actionData) ? actionData : [];
                return (
                    items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map((item: any, i: number) => (
                                <div key={i} className="space-y-1">
                                    <div><span className="font-medium">Owner:</span> {item?.owner || 'Not assigned'}</div>
                                    <div><span className="font-medium">Priority:</span> {item?.priority || 'Not set'}</div>
                                    <div><span className="font-medium">Deadline:</span> {item?.deadline || 'Not set'}</div>
                                    <div><span className="font-medium">Description:</span> {item?.description || item?.action_item || 'No description'}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>{actionData.action_items === "" ? 'No action items found' : actionData.action_items}</div>
                    )
                );

            case 'requirements':
                // If it's a requirements insight with JSON block
                if (content.includes('```json')) {
                    const [description, jsonPart] = content.split('```json');
                    return (
                        <div className="space-y-4">
                            <div className="whitespace-pre-wrap">{description.trim()}</div>
                            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                                <code>{jsonPart.split('```')[0]}</code>
                            </pre>
                        </div>
                    );
                }
                return <div className="whitespace-pre-wrap">{content}</div>;

            case 'summary':
                return <div className="whitespace-pre-wrap">{content}</div>;

            default:
                return <div className="whitespace-pre-wrap">{content}</div>;
        }
    } catch (error) {
        console.error('Error formatting insight:', error);
        return <div className="whitespace-pre-wrap">{insight.insight}</div>;
    }
};