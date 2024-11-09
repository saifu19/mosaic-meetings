import React from 'react';
import FacilitatorDashboard from './components/FacilitatorDashboard/FacilitatorDashboard';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

const App: React.FC = () => (
  <ErrorBoundary>
    <FacilitatorDashboard />
  </ErrorBoundary>
);

export default App;
