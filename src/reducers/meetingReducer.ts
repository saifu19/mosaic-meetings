import { MeetingState } from '../types';

type Action =
  | { type: 'START_MEETING' }
  | { type: 'END_MEETING' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'NEXT_AGENDA_ITEM' };
  // | { type: 'RESET_MEETING_STATE' };



//   const initialState: MeetingState = {
//     status: 'not_started', // This now aligns with MeetingStatus type
//     duration: 0,
//     currentAgendaItemIndex: 0,
//     error: null,
//     isLoading: false,
// };


export const meetingReducer = (state: MeetingState, action: Action): MeetingState => {
  switch (action.type) {
    case 'START_MEETING':
      return { ...state, status: 'in_progress', isLoading: false };
    case 'END_MEETING':
      return { ...state, status: 'ended', isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'NEXT_AGENDA_ITEM':
      return { ...state, currentAgendaItemIndex: state.currentAgendaItemIndex + 1 };
    
    // case 'RESET_MEETING_STATE':
    //   return { ...initialState };

    default:
      return state;
  }
};
