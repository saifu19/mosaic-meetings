import { useCallback, useState, useEffect, useRef } from 'react';
import { AIInsight, Meeting, MeetingState, TranscriptRange } from '@/types';
import {
	Card,
	CardTitle,
	CardContent,
	CardHeader,
	// CardFooter,
} from '@/components/ui/card';
import { config as cfg } from '@/config/env';
import { InsightTabs } from '@/components/InsightTabs/InsightTabs';
import { formatInsightContent } from '@/utils/insightFormatters';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface InsightsPanelProps {
	meeting: Meeting | null;
	currentAgendaItemIndex: number;
	// onInsightSelect: (insight: AIInsight) => void;
	meetingState: MeetingState;
	onVisibleRangesChange: (ranges: { start: string; end: string }[]) => void;
	isFullScreen: boolean;
	onToggleFullScreen: () => void;
}

export const InsightsPanel = ({
	meeting,
	currentAgendaItemIndex,
	// onInsightSelect,
	meetingState,
	onVisibleRangesChange,
	isFullScreen,
	onToggleFullScreen
}: InsightsPanelProps) => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [currentInsights, setCurrentInsights] = useState<AIInsight[]>([]);
	const [transcriptRanges, setTranscriptRanges] = useState<TranscriptRange[]>([]);
	const [formattedInsights, setFormattedInsights] = useState<Map<string, React.ReactNode>>(new Map());
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
	const contentRef = useRef<HTMLDivElement>(null);
	const lastScrollTop = useRef<number>(0);
	const currentAgendaIndexRef = useRef(currentAgendaItemIndex);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const [meetingAgents, setMeetingAgents] = useState<Array<{ id: number, name: string, order: number }>>([]);

	const handleScroll = () => {
		const element = contentRef.current;
		if (!element) return;

		const { scrollTop, scrollHeight, clientHeight } = element;
		const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;

		if (scrollTop < lastScrollTop.current && !isAtBottom) {
			setShouldAutoScroll(false);
		} else if (isAtBottom) {
			setShouldAutoScroll(true);
		}

		lastScrollTop.current = scrollTop;
	};

	const onNewInsight = useCallback((insight: AIInsight) => {
		setCurrentInsights(prev => {
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
						insight_type: meetingAgents[index].name,
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
	}, [currentAgendaIndexRef, onNewInsight]);

	const groupInsightsByTranscriptRange = useCallback((insights: AIInsight[]) => {
		const ranges: { [key: string]: TranscriptRange } = {};
	
		insights.forEach(insight => {
			const key = `${insight.start_transcript}-${insight.end_transcript}`;
	
			if (!ranges[key]) {
				ranges[key] = {
					start: insight.start_transcript,
					end: insight.end_transcript,
					insights: {}
				};
			}
	
			// Initialize array for this insight type if it doesn't exist
			if (!ranges[key].insights[insight.insight_type]) {
				ranges[key].insights[insight.insight_type] = [];
			}
	
			ranges[key].insights[insight.insight_type].push(insight);
		});
	
		return Object.values(ranges);
	}, []);

	// Fetch meeting agents
	useEffect(() => {
		const fetchMeetingAgents = async () => {
			if (!meeting?.id) return;

			try {
				const response = await axios.get(`${cfg.apiUrl}/api/get-agents-for-meeting?meeting_id=${meeting.id}`);
				const sortedAgents = response.data.sort((a: any, b: any) => a.order - b.order);
				setMeetingAgents(sortedAgents);
			} catch (error) {
				console.error('Error fetching meeting agents:', error);
			}
		};

		fetchMeetingAgents();
	}, [meeting?.id]);

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
	}, [shouldAutoScroll, transcriptRanges]);

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

	// Add batch formatting effect
	useEffect(() => {
		if (currentInsights.length === 0) {
			setFormattedInsights(new Map());
			return;
		}

		let isActive = true;
		const batchSize = 5;
		const unformattedInsights = currentInsights.filter(insight => !formattedInsights.has(insight.id));

		const formatBatch = async (startIndex: number) => {
			if (!isActive) return;

			const batch = unformattedInsights.slice(startIndex, startIndex + batchSize);
			if (batch.length === 0) return;

			setTimeout(() => {
				if (!isActive) return;

				setFormattedInsights(prev => {
					const newMap = new Map(prev);
					batch.forEach(insight => {
						newMap.set(insight.id, formatInsightContent(insight.insight));
					});
					return newMap;
				});

				formatBatch(startIndex + batchSize);
			}, 0);
		};

		formatBatch(0);

		return () => {
			isActive = false;
		};
	}, [currentInsights]);

	// Add filter by agenda item effect
	useEffect(() => {
		if (meeting?.agendaItems?.[currentAgendaItemIndex]) {
			const currentAgendaId = meeting.agendaItems[currentAgendaItemIndex].id;
			currentAgendaIndexRef.current = currentAgendaItemIndex;

			const filteredInsights = meeting.insights.filter(
				insight => insight.agenda === currentAgendaId
			);

			setCurrentInsights(filteredInsights);
		}
	}, [currentAgendaItemIndex, meeting?.agendaItems, meeting?.insights]);

	const handleObserve = useCallback((element: HTMLDivElement) => {
		if (observerRef.current) {
			observerRef.current.observe(element);
		}
	}, []);

	const handleUnobserve = useCallback((element: HTMLDivElement) => {
		if (observerRef.current) {
			observerRef.current.unobserve(element);
		}
	}, []);

	if (isFullScreen) {
		return (
			<div className="fixed inset-0 bg-white z-50 flex flex-col">
				<div className="p-4 border-b">
					<div className="flex justify-between items-center max-w-[2000px] mx-auto w-full">
						<CardTitle>AI Insights</CardTitle>
						<div className="flex items-center gap-4">
							<div className="text-sm text-gray-500">
								Total Insights: {currentInsights.length}
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={onToggleFullScreen}
								className="hover:bg-gray-100"
							>
								<Minimize2 className="h-5 w-5" />
							</Button>
						</div>
					</div>
				</div>
				<div className="flex-grow overflow-y-auto p-4" ref={contentRef} onScroll={handleScroll}>
					<div className="max-w-[2000px] mx-auto">
						<InsightTabs
							transcriptRanges={transcriptRanges}
							onObserve={handleObserve}
							onUnobserve={handleUnobserve}
							agents={meetingAgents}
						/>
					</div>
				</div>
			</div>
		);
	}

	return (
		<Card className="h-full flex flex-col">
			<CardHeader>
				<div className="flex justify-between items-center">
					<CardTitle>AI Insights</CardTitle>
					<div className="flex items-center gap-4">
						<div className="text-sm text-gray-500">
							Total Insights: {currentInsights.length}
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={onToggleFullScreen}
							className="hover:bg-gray-100"
						>
							<Maximize2 className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex-grow overflow-y-auto" ref={contentRef} onScroll={handleScroll}>
				<InsightTabs
					transcriptRanges={transcriptRanges}
					onObserve={handleObserve}
					onUnobserve={handleUnobserve}
					agents={meetingAgents}
				/>
			</CardContent>
		</Card>
	);
};