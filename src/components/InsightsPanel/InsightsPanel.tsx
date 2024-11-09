import React, { useCallback, useState, useMemo } from 'react';
import { AIInsight, InsightType, Meeting } from '@/types';
import { Brain, Lightbulb, Flag, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	Card,
	CardTitle,
	CardContent,
	CardDescription,
	CardHeader,
	CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface InsightsPanelProps {
    meeting: Meeting | null;
    currentAgendaItemIndex: number;
    onInsightSelect: (insight: AIInsight) => void;
    onNewInsight: (insight: AIInsight) => void;
}

export const InsightsPanel = ({
    meeting,
    currentAgendaItemIndex,
    onInsightSelect,
    onNewInsight
}: InsightsPanelProps) => {

	const currentInsights = useMemo(() => {
        if (!meeting?.agendaItems?.[currentAgendaItemIndex]) return [];
        return meeting.insights.filter(
            insight => insight.agendaItemId === meeting.agendaItems[currentAgendaItemIndex].id
        );
    }, [meeting, currentAgendaItemIndex]);

	const [aiPrompt, setAiPrompt] = useState("");

	const handleAIPrompt = (e: React.FormEvent) => {
		e.preventDefault();
		if (!aiPrompt.trim() || !meeting?.agendaItems?.[currentAgendaItemIndex]) return;
	
		const currentAgendaItemId = meeting.agendaItems[currentAgendaItemIndex].id;
	
		const newInsight: AIInsight = {
			id: Date.now().toString(),
			content: generateAIInsight(aiPrompt),
			type: 'think',
			timestamp: new Date().toLocaleTimeString(),
			agendaItemId: currentAgendaItemId,
			chatThread: [],
		};
	
		onNewInsight(newInsight);
		setAiPrompt("");
	};

	const generateAIInsight = useCallback((agendaItem: string): string => {
		const possibilities = [
			`Based on the discussion about ${agendaItem}, it seems that we need to allocate more resources to this task.`,
			`The team has made significant progress on ${agendaItem}. Consider sharing these achievements with stakeholders.`,
			`There appears to be some confusion around ${agendaItem}. It might be beneficial to schedule a separate meeting to clarify objectives.`,
			`The approach to ${agendaItem} could be optimized. Consider exploring alternative methodologies.`,
			`${agendaItem} is critical for our project's success. Ensure it remains a top priority in the coming sprint.`,
		];
		return possibilities[Math.floor(Math.random() * possibilities.length)];
	}, []);

	const getInsightIcon = (type: InsightType) => {
		switch (type) {
			case 'think':
				return <Brain className="h-5 w-5" />;
			case 'reflect':
				return <Lightbulb className="h-5 w-5" />;
			case 'plan':
				return <Flag className="h-5 w-5" />;
		}
	};

	const getInsightColor = (type: InsightType) => {
		switch (type) {
			case 'think':
				return 'text-purple-500 bg-purple-50';
			case 'reflect':
				return 'text-yellow-500 bg-yellow-50';
			case 'plan':
				return 'text-blue-500 bg-blue-50';
		}
	};

	return (
		<Card className="h-full flex flex-col">
			<CardHeader>
				<CardTitle>AI Insights</CardTitle>
			</CardHeader>
			<CardContent className="flex-grow overflow-y-auto">
				<div className="space-y-4">
					{currentInsights.map((insight) => (
						<Card
							key={insight.id}
							className="cursor-pointer hover:shadow-md transition-shadow"
							onClick={() => onInsightSelect(insight)}
						>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<div
										className={cn(
											'p-2 rounded-full',
											getInsightColor(insight.type)
										)}
									>
										{getInsightIcon(insight.type)}
									</div>
									<CardDescription>{insight.timestamp}</CardDescription>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm">{insight.content}</p>
								{insight.chatThread.length > 0 && (
									<div className="mt-2 text-xs text-muted-foreground">
										{insight.chatThread.length} messages in thread
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
			<CardFooter className="mt-auto">
				<form onSubmit={handleAIPrompt} className="w-full flex space-x-2">
					<Input
						value={aiPrompt}
						onChange={(e) => setAiPrompt(e.target.value)}
						placeholder="Ask AI for insights..."
						className="flex-grow"
					/>
					<Button type="submit">
						<Send className="h-4 w-4 mr-2" />
						Send
					</Button>
				</form>
			</CardFooter>
		</Card>

	);
};