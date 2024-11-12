// import { useState, useReducer, useMemo, useCallback, useEffect } from 'react';
// import { TooltipProvider } from '@/components/ui/tooltip';
// import { AddMeetingDialog } from '@/components/AddMeetingDialog/AddMeetingDialog';
// import { CreateMeetingTypeDialog } from '@/components/CreateMeetingTypeDialog/CreateMeetingTypeDialog';
// import { MeetingsAndKanbanView } from '@/components/MeetingsAndKanbanView/MeetingsAndKanbanView';

// import useMeetingTimer from '@/hooks/useMeetingTimer';
// import { meetingReducer } from '@/reducers/meetingReducer';
// import { Meeting, KanbanColumn } from '@/types';
// import { initialKanbanColumns, meetingTypes } from '@/data/mockData';
// import { MeetingContent } from '@/components/MeetingContent/MeetingContent';
// import { MeetingSidebar } from '@/components/MeetingSidebar/MeetingSidebar';
// import { QRCodeModal } from '@/components/QRCodeModal/QRCodeModal';
// import { AIInsightModalWrapper } from '@/components/AIInsightModalWrapper/AIInsightModalWrapper';
// import { useMeetingActions } from '@/hooks/useMeetingActions';
// import { useModalStates } from '@/hooks/useModalStates';
// import axios from 'axios';




// function FacilitatorDashboard() {
// 	const [meetings, setMeetings] = useState<Meeting[]>([]);

// 	const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
// 	const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(initialKanbanColumns);
// 	const [existingMeetings, setExistingMeetings] = useState<Meeting[]>([]);
// 	const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
// 	const [refreshTrigger, setRefreshTrigger] = useState(0);
	

	


// 	const [meetingState, dispatch] = useReducer(meetingReducer, {
// 		status: 'not_started',
// 		duration: 0,
// 		currentAgendaItemIndex: 0,
// 		error: null,
// 		isLoading: false,
// 	});
	
// 	// Derived State
	// const selectedMeeting = useMemo(() => meetings.find(m => m.id === selectedMeetingId) || null, [meetings, selectedMeetingId]);
// 	const meetingDuration = useMeetingTimer(meetingState.status === 'in_progress');

// 	const updateSelectedMeeting = (id: string) => {
// 		setSelectedMeetingId(id);
// 		// dispatch({ type: 'RESET_MEETING_STATE' });
// 		console.log(id);
// 		console.log(selectedMeetingId);
// 	}

// 	const modals = useModalStates();
// 	// const { startMeeting, stopMeeting } = useMeetingActions({
// 	// 	selectedMeeting,
// 	// 	setMeetings,
// 	// 	dispatch,
// 	// });

// 	useEffect(() => {
// 		const fetchMeetings = async () => {
// 			try {
// 				const response = await axios.get('https://mojomosaic.live:8443/get-meetings')
// 				const { upcoming, existing } = formatMeetings(response.data)
// 				setUpcomingMeetings(upcoming)
// 				setExistingMeetings(existing)
// 				setMeetings([...upcoming, ...existing])
// 				// const isAnyMeetingJoined = existing.some(meeting => meeting.isJoined) || upcoming.some(meeting => meeting.isJoined)
// 				// setHasJoinedMeeting(isAnyMeetingJoined)
// 			} catch (error: unknown) {
// 				if (error instanceof Error) {
// 					console.error('Error fetching meetings:', error.message)
// 				} else {
// 					console.error('Error fetching meetings:', String(error))
// 				}
// 			}
// 		}

// 		fetchMeetings()
// 	}, [refreshTrigger]);

// 	const formatMeetings = (meetings: any[]) => {
// 		const now = new Date()

// 		const formattedMeetings = meetings.map(meeting => {
// 			const meetingDate = meeting[3] ? new Date(meeting[3]) : new Date()
// 			const startTime = new Date(meetingDate.toLocaleString([], {
// 				weekday: 'short',
// 				month: 'short',
// 				day: 'numeric',
// 				year: 'numeric',
// 				hour: '2-digit',
// 				minute: '2-digit'
// 			}))
// 			return {
// 				id: meeting[0],
// 				title: meeting[1],
// 				description: meeting[2],
// 				rawTime: meetingDate,
// 				startTime: startTime,
// 				endTime: null,
// 				link: meeting[4],
// 				isJoined: meeting[5],
// 				participants: meeting[6] ? meeting[6] : [],
// 				status: meetingDate > now ? 'Upcoming' : 'Past',
// 				transcriptItems: meeting[7] ? meeting[7] : [],
// 				agendaItems: meetingTypes.scrum.defaultAgendaItems,
// 				insights: meeting[9] ? meeting[9] : [],
// 			}
// 		})

// 		const upcoming = formattedMeetings.filter(meeting => meeting.rawTime > now)
// 		const existing = formattedMeetings.filter(meeting => meeting.rawTime <= now)
// 		return { upcoming, existing }
// 	}

// 	// Utility Functions
// 	const formatTime = useCallback((seconds: number) => {
// 		const mins = Math.floor(seconds / 60);
// 		const secs = seconds % 60;
// 		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
// 	}, []);

// 	return (
		
// 		<TooltipProvider>
// 			<div className="flex h-screen bg-gray-100">
// 				<div className="flex-1">
// 						<MeetingsAndKanbanView
// 							existingMeetings={existingMeetings}
// 							upcomingMeetings={upcomingMeetings}
// 							kanbanColumns={kanbanColumns}
// 							setKanbanColumns={setKanbanColumns}
// 							onMeetingSelect={updateSelectedMeeting}
// 							onAddMeetingClick={modals.addMeeting.open}
// 							onCreateMeetingTypeClick={modals.createMeetingType.open}
// 						/>
// 				</div>
// 				{/* Add Meeting Dialog */}
// 				<AddMeetingDialog
// 					isOpen={modals.addMeeting.isOpen}
// 					onClose={modals.addMeeting.close}
// 					setMeetings={setMeetings}
// 					onMeetingAdded={() => setRefreshTrigger(prev => prev + 1)}
// 				/>

// 				{/* Create Meeting Type Dialog */}
// 				<CreateMeetingTypeDialog
// 					isOpen={modals.createMeetingType.isOpen}
// 					onClose={modals.createMeetingType.close}
// 				/>
// 			</div>
// 				{/* {selectedMeeting ? (
// 					<> */}
// 						{/* Left Sidebar */}
// 						{/* <MeetingSidebar
// 							meeting={selectedMeeting}
// 							meetingState={meetingState}
// 							meetingDuration={meetingDuration}
// 							formatTime={formatTime}
// 							onStartMeeting={startMeeting}
// 							onStopMeeting={stopMeeting}
// 							onShowQRCode={modals.qrCode.open}
// 							onBack={() => setSelectedMeetingId(null)}
// 						/> */}

// 						{/* Main Content */}
// 						{/* <MeetingContent
// 							meeting={selectedMeeting}
// 							meetingState={meetingState}
// 							selectedMeetingId={selectedMeetingId || ''}
// 							dispatch={dispatch}
// 							setMeetings={setMeetings}
// 							setSelectedInsight={modals.insight.select}
// 						/> */}
// 					{/* </> */}
				

// 				{/* AI Insight Modal */}
// 				{/* {modals.insight.selected && (
// 					<AIInsightModalWrapper
// 						selectedInsight={modals.insight.selected}
// 						selectedMeetingId={selectedMeetingId}
// 						kanbanColumns={kanbanColumns}
// 						setKanbanColumns={setKanbanColumns}
// 						setMeetings={setMeetings}
// 						onClose={modals.insight.close}
// 					/>
// 				)} */}

// 				{/* QR Code Modal */}
// 				{/* {modals.qrCode.isOpen && (
// 					<QRCodeModal
// 						isOpen={modals.qrCode.isOpen}
// 						onClose={modals.qrCode.close}
// 					/>
// 				)} */}

				
			
// 		</TooltipProvider>
// 	);
// }

// export default FacilitatorDashboard;



// FacilitatorDashboard.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { MeetingDashboard } from '@/components/MeetingDashboard/MeetingDashboard';
import { MeetingPage } from '@/components/MeetingPage/MeetingPage';
import { MeetingProvider } from '@/components/MeetingContext/MeetingContext';

function FacilitatorDashboard() {
    return (
        <Router>
            <Routes>
                {/* Dashboard Route */}
                <Route path="/" element={<MeetingDashboard />} />
                
                {/* Meeting Detail Route */}
                <Route path="/meeting/:meetingId" element={<MeetingProvider><MeetingPage /></MeetingProvider>} />
            </Routes>
        </Router>
    );
}

export default FacilitatorDashboard;
