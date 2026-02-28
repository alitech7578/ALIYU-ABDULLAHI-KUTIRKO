import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import ClientPage from './components/ClientPage';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Check auth status on mount
    checkAuth();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/status', { credentials: 'include' });
      const data = await response.json();
      if (data.authenticated) {
        setUser({ username: data.username });
      }
    } catch (err) {
      console.error('Auth check failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (route.startsWith('#/id/')) {
      return <ClientPage />;
    }
    
    if (!user) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return <AdminDashboard onLogout={handleLogout} />;
  };

  return <>{renderContent()}</>;
};

export default App;