import { useState, useEffect } from 'react';
import { MEETING_CONFIG } from '../constants';

const useMeetingTimer = (isActive: boolean) => {

  const REFRESH_BUFFER_SECONDS = 2;
  


  // Initialize duration based on saved start time
  const getInitialDuration = () => {
    const savedDuration = localStorage.getItem('meetingDuration');
    const savedStartTime = localStorage.getItem('meetingStartTime');
    
    if (savedDuration) {
      // If there's a saved duration, start from there with buffer
      return Number(savedDuration) + REFRESH_BUFFER_SECONDS;
    } else if (savedStartTime) {
      // Otherwise, calculate based on start time with buffer
      const elapsed = Math.floor((Date.now() - Number(savedStartTime)) / 1000);
      return elapsed + REFRESH_BUFFER_SECONDS;
    }
    return MEETING_CONFIG.DEFAULT_DURATION;
  };

  const [duration, setDuration] = useState(getInitialDuration);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => setDuration(prev => prev + 1), 1000);

    // Save current duration on unmount
    return () => {
      clearInterval(timer);
      localStorage.setItem('meetingDuration', duration.toString());
    };
  }, [isActive, duration]);

  return duration;
};

export default useMeetingTimer;
