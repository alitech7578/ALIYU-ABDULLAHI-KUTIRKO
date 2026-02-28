import React, { useState, useEffect } from 'react';
import { DatabaseIcon, UserCircleIcon, LogoutIcon, MoonIcon, SunIcon, DownloadIcon } from './IconComponents';

interface User {
  username: string;
  role: 'admin' | 'user';
}

interface HeaderProps {
  user?: User;
  onLogout?: () => void;
  companyName: string;
  companyLogo: string | null;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, companyName, companyLogo }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const themeToggleButton = (
    <div className="flex items-center gap-2">
      {deferredPrompt && (
        <button
          onClick={handleInstall}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent hover:bg-opacity-80 text-white text-xs font-bold rounded-lg transition-all animate-pulse"
          title="Install as Desktop App"
        >
          <DownloadIcon className="w-4 h-4" />
          <span className="hidden md:inline">DOWNLOAD APP</span>
        </button>
      )}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-brand-secondary/80 transition-colors"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <SunIcon className="w-6 h-6 text-yellow-300" />
        ) : (
          <MoonIcon className="w-6 h-6 text-brand-light" />
        )}
      </button>
    </div>
  );

  return (
    <header className="relative">
      <div className="flex justify-between items-center pt-4">
        {/* Empty div for spacing, visible to keep title centered */}
        <div className="w-48 hidden sm:block flex-shrink-0"></div>

        <div className="flex flex-col items-center flex-grow">
          <div className="flex justify-center items-center gap-4">
            {companyLogo ? (
              <img src={companyLogo} alt={`${companyName} Logo`} className="w-12 h-12 object-contain"/>
            ) : (
              <DatabaseIcon className="w-12 h-12 text-brand-accent"/>
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-brand-accent to-purple-500 text-center">
              {companyName}
            </h1>
          </div>
        </div>

        {user ? (
          <div className="w-48 flex-shrink-0 flex items-center justify-end gap-3 text-brand-light">
            {themeToggleButton}
            <UserCircleIcon className="w-8 h-8"/>
            <div className="text-left hidden md:block">
              <p className="font-bold whitespace-nowrap">{user.username}</p>
              {user.role && <p className="text-xs text-brand-muted capitalize">{user.role}</p>}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-brand-secondary/80 transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogoutIcon className="w-6 h-6 text-red-400"/>
              </button>
            )}
          </div>
        ) : (
           <div className="w-48 flex justify-end flex-shrink-0">
               {themeToggleButton}
           </div>
        )}
      </div>
    </header>
  );
};

export default Header;