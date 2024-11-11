// MeetingDetail.tsx
import { useReducer, useMemo ,useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MeetingSidebar } from '@/components/MeetingSidebar/MeetingSidebar';
import { MeetingContent } from '@/components/MeetingContent/MeetingContent';
import { AIInsightModalWrapper } from '@/components/AIInsightModalWrapper/AIInsightModalWrapper';
import { QRCodeModal } from '@/components/QRCodeModal/QRCodeModal';
import useMeetingTimer from '@/hooks/useMeetingTimer';
import { useModalStates } from '@/hooks/useModalStates';
import { useMeetingActions } from '@/hooks/useMeetingActions';
import { meetingReducer } from '@/reducers/meetingReducer';
import { Meeting } from '@/types';
import { meetingTypes } from '@/data/mockData'; // Update the path if `meetingTypes` is defined elsewhere
import axios from 'axios';


function MeetingDetail() {

    const [targetMeeting, setTargetMeeting] = useState<Meeting[]>([]);


    const { meetingId } = useParams();
    console.log("meeting:",meetingId)
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

    
    
    // const selectedMeeting = useMemo(() => meetings.find(m => m.id === meetingId), [meetings, meetingId]);
    const modals = useModalStates();
    const [meetingState, dispatch] = useReducer(meetingReducer, {
        status: 'not_started',
        duration: 0,
        currentAgendaItemIndex: 0,
        error: null,
        isLoading: false,
    });

    // Modify fetchMeetings to return Meeting[]
    const fetchMeetings = async (): Promise<Meeting[]> => {
        try {
            const response = await axios.get('https://mojomosaic.live:8443/get-meetings');
            return formatMeetings(response.data); // formatMeetings should return Meeting[]
        } catch (error) {
            console.error('Error fetching meetings:', error);
            return []; // Return an empty array if there’s an error
        }
    };
    

    // Use fetchMeetings to fetch and set the specific meeting by ID
    const fetchMeetingById = async (meetingId: string): Promise<Meeting | null> => {
        try {
            const meetings = await fetchMeetings();
            if(meetings){
                console.log("fetched all")
            }
            const targetMeeting = meetings.find(meeting => String(meeting.id) === meetingId) || null;
            console.log("function called")
            if(targetMeeting){
                console.log("get target")
            }
            else{
                console.log("no target")
            }
            return targetMeeting;
        } catch (error) {
            console.error('Error fetching the specific meeting:', error);
            return null;
        }
    };


    // Ensure formatMeetings returns Meeting[]
const formatMeetings = (meetings: any[]): Meeting[] => {
    const now = new Date();
    
    return meetings.map(meeting => {
        const meetingDate = new Date(meeting[3] || new Date());
        
        return {
            id: meeting[0],
            title: meeting[1],
            description: meeting[2],
            rawTime: meetingDate,
            startTime: meetingDate,
            endTime: meeting[8] ? new Date(meeting[8]) : null,
            link: meeting[4],
            isJoined: meeting[5],
            participants: meeting[6] || [],
            status: meetingDate > now ? 'Upcoming' : 'Past',
            transcriptItems: meeting[7] || [],
            agendaItems: meetingTypes.scrum.defaultAgendaItems,
            insights: meeting[9] || [],
        };
    });
};

    // Set the fetched meeting in useEffect
    useEffect(() => {
        const loadMeetingById = async () => {
            const meeting = await fetchMeetingById(String(meetingId)); 
            if (meeting) {
                setSelectedMeeting(meeting);([meeting]);
            } else {
                setSelectedMeeting(meeting);([]); 
            }
        };
        loadMeetingById();
    }, []);

    console.log("target meeting : ",targetMeeting)
    const meetingDuration = useMeetingTimer(meetingState.status === 'in_progress');
    const { startMeeting, stopMeeting } = useMeetingActions({
        selectedMeeting,
        setMeetings,
        dispatch,
    });

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-gray-100">
                <div>{}</div>
                {selectedMeeting && (
                    <>
                        <MeetingSidebar
                            meeting={selectedMeeting}
                            meetingState={meetingState}
                            meetingDuration={meetingDuration}
                            onStartMeeting={startMeeting}
                            onStopMeeting={stopMeeting}
                            onShowQRCode={modals.qrCode.open}
                            // onBack={() => navigate('/')} 
                            formatTime={function (): string {
                                throw new Error('Function not implemented.');
                            } }                        
                            />

                        <MeetingContent
                            meeting={selectedMeeting}
                            meetingState={meetingState}
                            selectedMeetingId={selectedMeeting.id || ''}
                            dispatch={dispatch}
                            setMeetings={setMeetings}
                            setSelectedInsight={modals.insight.select}
                        />
                    </>
                )}

                {modals.insight.selected && (
                    <AIInsightModalWrapper
                        selectedInsight={modals.insight.selected}
                        selectedMeetingId={selectedMeeting?.id ?? null}
                        onClose={modals.insight.close} kanbanColumns={[]} setKanbanColumns={function (): void {
                            throw new Error('Function not implemented.');
                        } } setMeetings={function (): void {
                            throw new Error('Function not implemented.');
                        } }                    />
                )}

                {modals.qrCode.isOpen && (
                    <QRCodeModal
                        isOpen={modals.qrCode.isOpen}
                        onClose={modals.qrCode.close}
                    />
                )}
            </div>
        </TooltipProvider>
    );
}

export default MeetingDetail;
