import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import ClientPage from './components/ClientPage';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange, false);

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, []);

  // Simple hash-based routing to show the public verification page
  if (route.startsWith('#/id/')) {
    return <ClientPage />;
  }
  
  // Default view is the Admin Dashboard as per the original App.tsx
  return <AdminDashboard />;
};

export default App;
