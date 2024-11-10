// Meeting Types
export type MeetingStatus = 'not_started' | 'in_progress' | 'ended';
export type InsightType = 'think' | 'reflect' | 'plan';
export type MeetingType = 'scrum' | 'sprint-planning' | 'traction-level10' | 'custom' | string;

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
	content: string;
	timestamp: string;
	agendaItemId: string;
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
