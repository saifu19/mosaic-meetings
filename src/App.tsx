import React from 'react';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { MeetingDashboard } from '@/components/MeetingDashboard/MeetingDashboard';
import { MeetingPage } from '@/components/MeetingPage/MeetingPage';
import { MeetingProvider } from '@/components/MeetingContext/MeetingContext';
import { AgentDashboard } from '@/components/AgentDashboard/AgentDashboard';
import { MeetingTypesDashboard } from '@/components/MeetingTypesDashboard/MeetingTypesDashboard';

const App: React.FC = () => (
  <ErrorBoundary>
    <Router>
      <Routes>
        {/* Dashboard Route */}
        <Route path="/" element={<MeetingDashboard />} />
        <Route path="/agents" element={<AgentDashboard />} />
        <Route path="/meeting-types" element={<MeetingTypesDashboard />} />
        {/* Meeting Detail Route */}
        <Route path="/meeting/:meetingId" element={<MeetingProvider><MeetingPage /></MeetingProvider>} />
      </Routes>
    </Router>
  </ErrorBoundary>
);

export default App;
