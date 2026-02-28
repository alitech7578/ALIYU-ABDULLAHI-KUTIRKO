import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import ClientPage from './components/ClientPage';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderContent = () => {
    if (route.startsWith('#/id/')) {
      return <ClientPage />;
    }
    
    return <AdminDashboard onLogout={() => {}} />;
  };

  return <>{renderContent()}</>;
};

export default App;