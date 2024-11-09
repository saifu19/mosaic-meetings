import { useCallback } from 'react';
import { Meeting } from '@/types';

interface UseAgendaStateProps {
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  dispatch: React.Dispatch<any>;
  selectedMeetingId: string;
}

export const useAgendaState = ({ setMeetings, dispatch, selectedMeetingId }: UseAgendaStateProps) => {
  const moveToNextAgendaItem = useCallback((currentIndex: number, nextIndex: number) => {
    setMeetings(prevMeetings => prevMeetings.map(meeting => {
      if (meeting.id !== selectedMeetingId) return meeting;
      const updatedAgendaItems = [...meeting.agendaItems];
      updatedAgendaItems[currentIndex].status = 'completed';
      updatedAgendaItems[nextIndex].status = 'in_progress';
      return {
        ...meeting,
        agendaItems: updatedAgendaItems
      };
    }));
    dispatch({ type: 'NEXT_AGENDA_ITEM' });
  }, [setMeetings, dispatch, selectedMeetingId]);

  return { moveToNextAgendaItem };
}; 