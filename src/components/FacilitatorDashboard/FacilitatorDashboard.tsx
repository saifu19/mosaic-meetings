import { useState, useReducer, useMemo, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AddMeetingDialog } from '@/components/AddMeetingDialog/AddMeetingDialog';
import { CreateMeetingTypeDialog } from '@/components/CreateMeetingTypeDialog/CreateMeetingTypeDialog';
import { MeetingsAndKanbanView } from '@/components/MeetingsAndKanbanView/MeetingsAndKanbanView';

import useMeetingTimer from '@/hooks/useMeetingTimer';
import { meetingReducer } from '@/reducers/meetingReducer';
import { Meeting, KanbanColumn } from '@/types';
import { mockMeetings, initialKanbanColumns } from '@/data/mockData';
import { MeetingContent } from '@/components/MeetingContent/MeetingContent';
import { MeetingSidebar } from '@/components/MeetingSidebar/MeetingSidebar';
import { QRCodeModal } from '@/components/QRCodeModal/QRCodeModal';
import { AIInsightModalWrapper } from '@/components/AIInsightModalWrapper/AIInsightModalWrapper';
import { useMeetingActions } from '@/hooks/useMeetingActions';
import { useModalStates } from '@/hooks/useModalStates';

function FacilitatorDashboard() {
	const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
	const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
	const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(initialKanbanColumns);

	const [meetingState, dispatch] = useReducer(meetingReducer, {
		status: 'not_started',
		duration: 0,
		currentAgendaItemIndex: 0,
		error: null,
		isLoading: false,
	});

	// Derived State
	const selectedMeeting = useMemo(() => meetings.find(m => m.id === selectedMeetingId) || null, [meetings, selectedMeetingId]);
	const meetingDuration = useMeetingTimer(meetingState.status === 'in_progress');

	const modals = useModalStates();
    const { startMeeting, stopMeeting } = useMeetingActions({
        selectedMeeting,
        setMeetings,
        dispatch
    });

	// Utility Functions
	const formatTime = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}, []);

	return (
		<TooltipProvider>
			<div className="flex h-screen bg-gray-100">
				{selectedMeeting ? (
					<>
						{/* Left Sidebar */}
						<MeetingSidebar
							meeting={selectedMeeting}
							meetingState={meetingState}
							meetingDuration={meetingDuration}
							formatTime={formatTime}
							onStartMeeting={startMeeting}
							onStopMeeting={stopMeeting}
							onShowQRCode={modals.qrCode.open}
							onBack={() => setSelectedMeetingId(null)}
						/>

						{/* Main Content */}
						<MeetingContent
							meeting={selectedMeeting}
							meetingState={meetingState}
							selectedMeetingId={selectedMeetingId || ''}
							dispatch={dispatch}
							setMeetings={setMeetings}
							setSelectedInsight={modals.insight.select}
						/>
					</>
				) : (
					<div className="flex-1">
						<MeetingsAndKanbanView
							meetings={meetings}
							kanbanColumns={kanbanColumns}
							setKanbanColumns={setKanbanColumns}
							onMeetingSelect={setSelectedMeetingId}
							onAddMeetingClick={modals.addMeeting.open}
							onCreateMeetingTypeClick={modals.createMeetingType.open}
						/>
					</div>
				)}

				{/* AI Insight Modal */}
				{modals.insight.selected && (
					<AIInsightModalWrapper
						selectedInsight={modals.insight.selected}
						selectedMeetingId={selectedMeetingId}
						kanbanColumns={kanbanColumns}
						setKanbanColumns={setKanbanColumns}
						setMeetings={setMeetings}
						onClose={modals.insight.close}
					/>
				)}

				{/* QR Code Modal */}
				{modals.qrCode.isOpen && (
					<QRCodeModal
						isOpen={modals.qrCode.isOpen}
						onClose={modals.qrCode.close}
					/>
				)}

				{/* Add Meeting Dialog */}
				<AddMeetingDialog
					isOpen={modals.addMeeting.isOpen}
					onClose={modals.addMeeting.close}
					setMeetings={setMeetings}
				/>

				{/* Create Meeting Type Dialog */}
				<CreateMeetingTypeDialog
					isOpen={modals.createMeetingType.isOpen}
					onClose={modals.createMeetingType.close}
				/>
			</div>
		</TooltipProvider>
	);
}

export default FacilitatorDashboard;
