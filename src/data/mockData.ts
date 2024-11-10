import { Participant, Meeting, KanbanColumn, AgendaItem } from '../types';

export const mockParticipants: Participant[] = [
    { id: "1", name: "John Doe", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "2", name: "Jane Smith", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "3", name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "4", name: "Emily Brown", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "5", name: "Alex Lee", avatar: "/placeholder.svg?height=32&width=32" },
];

export const mockMeetings: Meeting[] = [
    {
        id: "1",
        title: "Daily Scrum",
        description: "Review progress and plan for the day",
        startTime: null,
        endTime: null,
        agendaItems: [
            { id: "1", title: "Yesterday's Progress", duration: 5, status: 'not_started' },
            { id: "2", title: "Today's Plan", duration: 5, status: 'not_started' },
            { id: "3", title: "Blockers", duration: 5, status: 'not_started' },
        ],
        transcriptItems: [],
        insights: [],
        participants: mockParticipants,
        link: "",
        isJoined: false,
    },
    {
        id: "2",
        title: "Sprint Planning",
        description: "Plan the upcoming sprint",
        startTime: null,
        endTime: null,
        agendaItems: [
            { id: "1", title: "Sprint Goal", duration: 15, status: 'not_started' },
            { id: "2", title: "Backlog Refinement", duration: 30, status: 'not_started' },
            { id: "3", title: "Capacity Planning", duration: 15, status: 'not_started' },
        ],
        transcriptItems: [],
        insights: [],
        participants: mockParticipants,
        link: "",
        isJoined: false,
    },
];

export const initialKanbanColumns: KanbanColumn[] = [
    { id: "1", title: "To Do", items: [] },
    { id: "2", title: "In Progress", items: [] },
    { id: "3", title: "Done", items: [] },
];

export const meetingTypes: { [key in string]: { title: string, description: string, defaultAgendaItems: AgendaItem[] } } = {
    'scrum': {
        title: "Daily Scrum",
        description: "A short, daily meeting for the development team to plan for the next 24 hours",
        defaultAgendaItems: [
            { id: "1", title: "What did you do yesterday?", duration: 5, status: 'not_started' },
            { id: "2", title: "What will you do today?", duration: 5, status: 'not_started' },
            { id: "3", title: "Are there any impediments in your way?", duration: 5, status: 'not_started' },
        ]
    },
    'sprint-planning': {
        title: "Sprint Planning",
        description: "A meeting to define the Sprint Goal and select Product Backlog Items for the Sprint",
        defaultAgendaItems: [
            { id: "1", title: "Sprint Goal", duration: 15, status: 'not_started' },
            { id: "2", title: "Product Backlog Refinement", duration: 30, status: 'not_started' },
            { id: "3", title: "Sprint Backlog Creation", duration: 45, status: 'not_started' },
        ]
    },
    'traction-level10': {
        title: "Traction Level 10 Meeting",
        description: "A weekly meeting format from the Traction/EOS methodology",
        defaultAgendaItems: [
            { id: "1", title: "Segue", duration: 5, status: 'not_started' },
            { id: "2", title: "Scorecard Review", duration: 5, status: 'not_started' },
            { id: "3", title: "Rock Review", duration: 5, status: 'not_started' },
            { id: "4", title: "Customer/Employee Headlines", duration: 5, status: 'not_started' },
            { id: "5", title: "To-Do List", duration: 5, status: 'not_started' },
            { id: "6", title: "IDS (Identify, Discuss, Solve)", duration: 60, status: 'not_started' },
            { id: "7", title: "Conclude", duration: 5, status: 'not_started' },
        ]
    },
    'custom': {
        title: "Custom Meeting",
        description: "Create a custom meeting with your own agenda items",
        defaultAgendaItems: []
    }
};
