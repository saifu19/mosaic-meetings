import React, { useCallback, useState, useEffect, useRef } from 'react';
import { AIInsight, InsightType, Meeting, MeetingState } from '@/types';
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
import { config as cfg } from '@/config/env';

interface InsightsPanelProps {
	meeting: Meeting | null;
	currentAgendaItemIndex: number;
	// onInsightSelect: (insight: AIInsight) => void;
	meetingState: MeetingState;
}

export const InsightsPanel = ({
	meeting,
	currentAgendaItemIndex,
	// onInsightSelect,
	meetingState
}: InsightsPanelProps) => {

	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [currentInsights, setCurrentInsights] = useState<AIInsight[]>([]);

	const currentAgendaIndexRef = useRef(currentAgendaItemIndex);

	const [aiPrompt, setAiPrompt] = useState("");

	const handleAIPrompt = (e: React.FormEvent) => {
		e.preventDefault();
		if (!aiPrompt.trim() || !meeting?.agendaItems?.[currentAgendaItemIndex]) return;

		const currentAgendaItemId = meeting.agendaItems[currentAgendaItemIndex].id;

		const newInsight: AIInsight = {
			id: Date.now().toString(),
			insight: generateAIInsight(aiPrompt),
			insight_type: 'context',
			created_at: new Date().toLocaleTimeString(),
			agenda: currentAgendaItemId,
			start_transcript: '',
			end_transcript: '',
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
			case 'requirements':
				return <Brain className="h-5 w-5" />;
			case 'context':
				return <Lightbulb className="h-5 w-5" />;
			case 'action_items':
				return <Flag className="h-5 w-5" />;
			case 'summary':
				return <Flag className="h-5 w-5" />;
		}
	};

	const getInsightColor = (type: InsightType) => {
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

	const formatInsightContent = (insight: AIInsight) => {
		if (!insight.insight) return '';
	
		try {
			let content = insight.insight;
			// Remove outer quotes if they exist
			content = content.replace(/^"(.*)"$/, '$1')
				.replace(/\\n/g, '\n')
				.replace(/\\"/g, '"')
				.replace(/\\\\/g, '\\')
				.trim();
	
			switch (insight.insight_type) {
				case 'context':
					const contextData = JSON.parse(content);
					return (
						<div className="space-y-2">
							<div className="font-medium">Current Topic: {contextData.current_topic}</div>
							
							<div>
								<div className="font-medium">Related Topics:</div>
								{contextData.related_topics.map((topic: string, i: number) => (
									<div key={i} className="ml-4">• {topic}</div>
								))}
							</div>
							
							<div>
								<div className="font-medium">Discussion Progress:</div>
								{contextData.discussion_progress.map((progress: string, i: number) => (
									<div key={i} className="ml-4">• {progress}</div>
								))}
							</div>
						</div>
					);
	
				case 'action_items':
					const actionData = JSON.parse(content);
					const items = actionData.action_items || actionData;
					return (
						<div className="space-y-4">
							{items.map((item: any, i: number) => (
								<div key={i} className="space-y-1">
									<div><span className="font-medium">Owner:</span> {item.owner}</div>
									<div><span className="font-medium">Priority:</span> {item.priority}</div>
									<div><span className="font-medium">Deadline:</span> {item.deadline}</div>
									<div><span className="font-medium">Description:</span> {item.description || item.action_item}</div>
								</div>
							))}
						</div>
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

	const onNewInsight = (insight: AIInsight) => {
		setCurrentInsights(prev => [...prev, insight]);
		meeting?.insights.push(insight);
	};

	useEffect(() => {
		currentAgendaIndexRef.current = currentAgendaItemIndex;
	
		if (meeting?.agendaItems?.[currentAgendaItemIndex]) {
			const currentAgendaId = meeting.agendaItems[currentAgendaItemIndex].id;
			const filteredInsights = meeting.insights.filter(
				insight => insight.agenda === currentAgendaId
			);
			setCurrentInsights(filteredInsights);
		}
	}, [currentAgendaItemIndex, meeting?.agendaItems, meeting?.insights]);


	useEffect(() => {
		if (!meeting?.id || !meeting.isJoined || meetingState.status !== 'in_progress') {
			if (socket) {
				console.log('Closing WebSocket due to meeting state change');
				socket.close();
				setSocket(null);
			}
			return;
		}
	
		let reconnectAttempts = 0;
		const MAX_RECONNECT_ATTEMPTS = 5;
		const RECONNECT_DELAY = 2000;
	
		function connect() {
			if (!meeting?.isJoined || meetingState.status !== 'in_progress') {
				return null;
			}
	
			console.log('Initializing WebSocket connection for meeting:', meeting?.id);
			const wsUrl = `${cfg.wsUrl}/ws/analysis/?meeting_id=${meeting?.id}`;
			console.log('Connecting to:', wsUrl);
			
			const newSocket = new WebSocket(wsUrl);
	
			newSocket.onopen = () => {
				console.log('WebSocket Connected ✅');
				reconnectAttempts = 0;
				setSocket(newSocket);
			};
	
			newSocket.onerror = (error) => {
				console.error('WebSocket Connection Error ❌:', error);
			};
	
			newSocket.onclose = (event) => {
				console.log('WebSocket Disconnected ⚠️:', event.reason);
				setSocket(null);
	
				if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
					reconnectAttempts++;
					console.log(`Attempting to reconnect... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
					setTimeout(connect, RECONNECT_DELAY);
				} else {
					console.log('Max reconnection attempts reached');
				}
			};
	
			newSocket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data).data;
					console.log(data);
					if (data.meeting_id === meeting?.id) {
						console.log('Received message:', data);
						const currentAgendaId = meeting.agendaItems[currentAgendaIndexRef.current]?.id;
						Object.entries(data.analysis).forEach(([insightType, value]) => {
							// Ensure the value is a string before creating the insight
							let insightValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
			
							const newInsight: AIInsight = {
								id: `${data.id}_${insightType}`,
								insight: insightValue,
								insight_type: insightType as InsightType,
								created_at: data.timestamp,
								agenda: data.agenda_id,
								start_transcript: data.start_transcript,
								end_transcript: data.end_transcript
							};
			
							if (newInsight.agenda === currentAgendaId) {
								console.log('Adding new insight to state:', newInsight);
								onNewInsight(newInsight);
							}
						});
					}
				} catch (error) {
					console.error('Error processing message:', error);
				}
			};
	
			return newSocket;
		}
	
		const newSocket = connect();
	
		return () => {
			console.log('Cleaning up WebSocket connection');
			if (newSocket) {
				newSocket.close();
				setSocket(null);
			}
			reconnectAttempts = MAX_RECONNECT_ATTEMPTS;
		};
	}, [meeting?.id, meeting?.isJoined, meetingState.status]);

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
							// onClick={() => onInsightSelect(insight)}
						>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<div
										className={cn(
											'p-2 rounded-full',
											getInsightColor(insight.insight_type)
										)}
									>
										{getInsightIcon(insight.insight_type)}
									</div>
									<CardDescription>{insight.created_at}</CardDescription>
								</div>
							</CardHeader>
							<CardContent>
								{formatInsightContent(insight)}
								{/* {insight.chatThread.length > 0 && (
									<div className="mt-2 text-xs text-muted-foreground">
										{insight.chatThread.length} messages in thread
									</div>
								)} */}
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