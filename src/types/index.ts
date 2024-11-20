// Meeting Types
export type MeetingStatus = 'not_started' | 'in_progress' | 'ended';
export type InsightType = 'think' | 'reflect' | 'plan';
export interface MeetingType {
    key: string;
    title: string;
    description: string;
    defaultAgendaItems: AgendaItem[];
}

// State Interfaces
export interface MeetingState {
	status: MeetingStatus;
	duration: number;
	currentAgendaItemIndex: number;
	error: string | null;
	isLoading: boolean;
}

export interface Meeting {
	id: string;
	title: string;
	description: string;
	link: string | null;
	startTime: Date | null;
	endTime: Date | null;
	isJoined: boolean;
	meetingType: string;
	agendaItems: AgendaItem[];
	transcriptItems: TranscriptItem[];
	insights: AIInsight[];
	participants: Participant[];
}

export interface AgendaItem {
	id: string;
	title: string;
	duration: number;
	status: 'not_started' | 'in_progress' | 'completed';
}

export interface TranscriptItem {
	id: string;
	speaker: string;
	message: string;
	timestamp: string;
	agenda: string;
	aiInsight?: AIInsight;
}

export interface AIInsight {
	id: string;
	content: string;
	type: InsightType;
	timestamp: string;
	agendaItemId: string;
	chatThread: ChatMessage[];
}

export interface ChatMessage {
	id: string;
	sender: string;
	content: string;
	timestamp: string;
}

export interface Participant {
	id: string;
	name: string;
	avatar: string;
}

export interface KanbanColumn {
	id: string;
	title: string;
	items: { id: string; content: string }[];
}
