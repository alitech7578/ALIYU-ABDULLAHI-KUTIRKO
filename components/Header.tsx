import React from 'react';
import { DatabaseIcon, UserCircleIcon, LogoutIcon } from './IconComponents';

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
           <div className="w-48 hidden sm:block flex-shrink-0"></div>
        )}
      </div>
    </header>
  );
};

export default Header;
