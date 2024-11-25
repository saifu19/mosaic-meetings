import React, { useCallback, useState, useEffect, useRef } from 'react';
import { AIInsight, InsightType, Meeting, MeetingState } from '@/types';
import { Brain, Lightbulb, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	Card,
	CardTitle,
	CardContent,
	CardDescription,
	CardHeader,
	// CardFooter,
} from '@/components/ui/card';
import { config as cfg } from '@/config/env';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';


interface GroupedInsights {
	requirements: AIInsight[];
	context: AIInsight[];
	action_items: AIInsight[];
	summary: AIInsight[];
}

interface TranscriptRange {
	start: string;
	end: string;
	insights: GroupedInsights;
}

interface InsightsPanelProps {
	meeting: Meeting | null;
	currentAgendaItemIndex: number;
	// onInsightSelect: (insight: AIInsight) => void;
	meetingState: MeetingState;
	onVisibleRangesChange: (ranges: { start: string; end: string }[]) => void;
}

export const InsightsPanel = ({
	meeting,
	currentAgendaItemIndex,
	// onInsightSelect,
	meetingState,
	onVisibleRangesChange
}: InsightsPanelProps) => {

	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [currentInsights, setCurrentInsights] = useState<AIInsight[]>([]);
	const [transcriptRanges, setTranscriptRanges] = useState<TranscriptRange[]>([]);
	const insightTypes: InsightType[] = ['action_items', 'requirements', 'summary', 'context'];
	const [formattedInsights, setFormattedInsights] = useState<Map<string, React.ReactNode>>(new Map());
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
	const contentRef = useRef<HTMLDivElement>(null);
	const lastScrollTop = useRef<number>(0);

	const formatInsightContentMemoized = useCallback((insight: AIInsight) => {
		return formatInsightContent(insight);
	}, []);
	const currentAgendaIndexRef = useRef(currentAgendaItemIndex);
	const observerRef = useRef<IntersectionObserver | null>(null);

	const handleScroll = () => {
		const element = contentRef.current;
		if (!element) return;

		const { scrollTop, scrollHeight, clientHeight } = element;
		const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50; // Increased threshold

		if (scrollTop < lastScrollTop.current && !isAtBottom) {
			setShouldAutoScroll(false);
		} else if (isAtBottom) {
			setShouldAutoScroll(true);
		}

		lastScrollTop.current = scrollTop;
	};

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

	const isValidJSON = (str: string): boolean => {
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
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
									contextData.discussion_progress.map((progress: string, i: number) => (
										<div key={i} className="ml-4">• {progress}</div>
									))
								) : (
									<div>{contextData.discussion_progress === "" ? 'No discussion progress found' : contextData.discussion_progress}</div>
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

	const onNewInsight = useCallback((insight: AIInsight) => {
		setCurrentInsights(prev => {
			// Check if insight already exists to prevent duplicates
			if (prev.some(i => i.id === insight.id)) {
				return prev;
			}
			return [...prev, insight];
		});
	}, []);

	const handleWebSocketMessage = useCallback((event: MessageEvent) => {
		try {
			const data = (JSON.parse(event.data)).data;
			if (data.meeting_id === meeting?.id) {
				const currentAgendaId = meeting?.agendaItems[currentAgendaIndexRef.current]?.id;

				data.analysis.forEach((analysisItem: any, index: number) => {
					const newInsight: AIInsight = {
						id: data.ids[index].toString(),
						insight: analysisItem,
						insight_type: insightTypes[index],
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
	}, [meeting?.id, meeting?.agendaItems, currentAgendaIndexRef, insightTypes, onNewInsight]);

	const groupInsightsByTranscriptRange = useCallback((insights: AIInsight[]) => {
		const ranges: { [key: string]: TranscriptRange } = {};

		console.log('Grouping insights for current agenda item:', insights.length);

		insights.forEach(insight => {
			const key = `${insight.start_transcript}-${insight.end_transcript}`;

			if (!ranges[key]) {
				ranges[key] = {
					start: insight.start_transcript,
					end: insight.end_transcript,

					insights: {
						requirements: [],
						context: [],
						action_items: [],
						summary: []
					}
				};
			}

			ranges[key].insights[insight.insight_type].push(insight);
		});

		return Object.values(ranges);
	}, []);

	// Auto scroll to bottom of insights panel
	useEffect(() => {
		if (shouldAutoScroll && contentRef.current) {
			const scrollToBottom = () => {
				if (contentRef.current) {
					contentRef.current.scrollTop = contentRef.current.scrollHeight;
				}
			};
			requestAnimationFrame(scrollToBottom);
		}
	}, [shouldAutoScroll, currentInsights, transcriptRanges, formattedInsights]);

	// Update visible ranges and Highlight
	useEffect(() => {
		const visibleRanges = new Set<string>();
		let debounceTimeout: NodeJS.Timeout;

		const debouncedUpdate = () => {
			const ranges = Array.from(visibleRanges).map(key => {
				const [start, end] = key.split('-');
				return { start, end };
			});
			onVisibleRangesChange(ranges);
		};

		observerRef.current = new IntersectionObserver(
			(entries) => {
				let hasChanges = false;

				entries.forEach(entry => {
					const element = entry.target;
					const start = element.getAttribute('data-start');
					const end = element.getAttribute('data-end');
					if (!start || !end) return;

					const key = `${start}-${end}`;
					const isCurrentlyVisible = visibleRanges.has(key);

					if (entry.isIntersecting && !isCurrentlyVisible) {
						visibleRanges.add(key);
						hasChanges = true;
					} else if (!entry.isIntersecting && isCurrentlyVisible) {
						visibleRanges.delete(key);
						hasChanges = true;
					}
				});

				if (hasChanges) {
					clearTimeout(debounceTimeout);
					debounceTimeout = setTimeout(debouncedUpdate, 150); // Increased debounce time
				}
			},
			{
				root: null,
				threshold: [0, 0.1], // Only observe at these thresholds
				rootMargin: '20px 0px' // Add some vertical margin
			}
		);

		return () => {
			clearTimeout(debounceTimeout);
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [onVisibleRangesChange]);

	// Group insights by transcript range
	useEffect(() => {
		if (currentInsights.length > 0) {
			const ranges = groupInsightsByTranscriptRange(currentInsights);
			setTranscriptRanges(ranges);
		} else {
			// Clear transcript ranges when there are no insights
			setTranscriptRanges([]);
		}
	}, [currentInsights, groupInsightsByTranscriptRange]);

	// Filter insights by current agenda item
	useEffect(() => {
		if (meeting?.agendaItems?.[currentAgendaItemIndex]) {
			const currentAgendaId = meeting.agendaItems[currentAgendaItemIndex].id;
			currentAgendaIndexRef.current = currentAgendaItemIndex;
			console.log('Current Agenda ID:', currentAgendaId);

			// Filter insights by current agenda item
			const filteredInsights = meeting.insights.filter(
				insight => insight.agenda === currentAgendaId
			);

			console.log('Filtered Insights:', filteredInsights.length);
			setCurrentInsights(filteredInsights);
		}
	}, [currentAgendaItemIndex, meeting?.agendaItems, meeting?.insights]);

	// Connect to WebSocket
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

			newSocket.onmessage = handleWebSocketMessage;

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

	// Format insights
	useEffect(() => {
		if (currentInsights.length === 0) {
			setFormattedInsights(new Map());
			return;
		}

		let isActive = true;
		const batchSize = 5; // Format 5 insights at a time
		const unformattedInsights = currentInsights.filter(insight => !formattedInsights.has(insight.id));

		const formatBatch = async (startIndex: number) => {
			if (!isActive) return;

			const batch = unformattedInsights.slice(startIndex, startIndex + batchSize);
			if (batch.length === 0) return;

			// Use setTimeout to yield to the main thread
			setTimeout(() => {
				if (!isActive) return;

				setFormattedInsights(prev => {
					const newMap = new Map(prev);
					batch.forEach(insight => {
						newMap.set(insight.id, formatInsightContentMemoized(insight));
					});
					return newMap;
				});

				// Process next batch
				formatBatch(startIndex + batchSize);
			}, 0);
		};

		formatBatch(0);

		return () => {
			isActive = false;
		};
	}, [currentInsights, formatInsightContentMemoized]);

	const renderInsightCard = (insight: AIInsight, range: TranscriptRange) => (
		<Card
			key={insight.id}
			className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
			data-start={range.start}
			data-end={range.end}
			data-type={insight.insight_type}
			ref={(element) => {
				if (element && observerRef.current) {
					observerRef.current.observe(element);
				}
			}}
		>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className={cn('p-2 rounded-full', getInsightColor(insight.insight_type))}>
						{getInsightIcon(insight.insight_type)}
					</div>
					<CardDescription>{insight.created_at}</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				{formatInsightContent(insight)}
			</CardContent>
		</Card>
	);

	const RangeContainer = React.memo(({ range }: { range: TranscriptRange }) => {
		const containerRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			const element = containerRef.current;
			if (element && observerRef.current) {
				observerRef.current.observe(element);
				return () => {
					if (observerRef.current) {
						observerRef.current.unobserve(element);
					}
				};
			}
		}, []);

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
					insights.length > 0 && (
						<div key={type} className="insight-group">
							<h3 className="font-semibold mb-2 capitalize">
								{type.replace('_', ' ')}
							</h3>
							<div className="insight-cards">
								{insights.map((insight: AIInsight) => (
									<InsightCard
										key={insight.id}
										insight={insight}
										type={type as InsightType}
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

	const InsightCard = React.memo(({ insight, type }: { insight: AIInsight; type: InsightType }) => {
		const formattedContent = formattedInsights.get(insight.id);

		return (
			<Card className="mb-2 cursor-pointer hover:shadow-md transition-shadow">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<div className={cn('p-2 rounded-full', getInsightColor(type))}>
							{getInsightIcon(type)}
						</div>
						<CardDescription>{insight.created_at}</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					{formattedContent || (
						<div className="animate-pulse">
							<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	});

	InsightCard.displayName = 'InsightCard';

	return (
		<Card className="h-full flex flex-col">
			<CardHeader>
				<CardTitle>AI Insights</CardTitle>
				<div className="text-sm text-gray-500">
					Total Insights: {currentInsights.length}
				</div>
			</CardHeader>
			<CardContent className="flex-grow overflow-y-auto" ref={contentRef} onScroll={handleScroll}>
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
							<RangeContainer key={`${range.start}-${range.end}`} range={range} />
						))}
					</TabsContent>

					{/* Individual tabs for each insight type */}
					{['requirements', 'context', 'action_items', 'summary'].map(type => (
						<TabsContent key={type} value={type}>
							{transcriptRanges.map((range, index) => (
								range.insights[type as keyof GroupedInsights].length > 0 && (
									<div key={index} className="mb-6 border-b pb-4">
										<div className="insight-cards">
											{range.insights[type as keyof GroupedInsights].map(insight =>
												renderInsightCard(insight, range)
											)}
										</div>
									</div>
								)
							))}
						</TabsContent>
					))}
				</Tabs>
			</CardContent>
			{/* <CardFooter className="mt-auto">
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
			</CardFooter> */}
		</Card>

	);
};