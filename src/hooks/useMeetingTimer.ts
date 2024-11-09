import { useState, useEffect } from 'react';
import { MEETING_CONFIG } from '../constants';

const useMeetingTimer = (isActive: boolean) => {
  const [duration, setDuration] = useState(<number>MEETING_CONFIG.DEFAULT_DURATION);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  return duration;
};

export default useMeetingTimer;
