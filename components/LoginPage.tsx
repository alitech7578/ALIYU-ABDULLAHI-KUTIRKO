import React, { useState } from 'react';
import { UserCircleIcon, EyeIcon, EyeSlashIcon, DatabaseIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';


const API_URL = 'http://localhost:3001/api';

interface User {
  username: string;
  role: 'admin' | 'user';
}

interface LoginPageProps {
    onLogin: (token: string, user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Fetch branding from local storage
    const [companyName] = useLocalStorage('company-name', 'Data Collector Pro');
    const [companyLogo] = useLocalStorage<string | null>('company-logo', null);
    const [companyEmail] = useLocalStorage('company-email', 'contact@example.com');
    const [companyAddress] = useLocalStorage('company-address', '123 Innovation Drive, Tech City');
    const [companyContent] = useLocalStorage('company-content', 'Streamlining data management with intuitive solutions.');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Login failed');
            }

            const { token, user } = await response.json();
            onLogin(token, user);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 flex flex-col items-center gap-4">
                     {companyLogo ? (
                        <img src={companyLogo} alt={`${companyName} Logo`} className="h-16 object-contain"/>
                     ) : (
                        <UserCircleIcon className="w-24 h-24 mx-auto text-brand-accent"/>
                     )}
                     <h1 className="text-3xl font-extrabold text-brand-light">{companyName}</h1>
                     <p className="text-brand-muted">Please sign in to continue.</p>
                </div>
                <div className="bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-brand-muted mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., admin"
                                required
                                className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-brand-light"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-brand-muted mb-2">
                                Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="e.g., password123"
                                required
                                className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-brand-light"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 top-7 flex items-center px-3 text-brand-muted hover:text-brand-light"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <div>
                             <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-300 disabled:bg-brand-accent/50 disabled:cursor-not-allowed"
                                >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <footer className="absolute bottom-0 w-full p-6 text-center text-brand-muted text-sm">
                <p className="max-w-2xl mx-auto">{companyContent}</p>
                <div className="mt-2 flex justify-center items-center gap-x-4 gap-y-1 flex-wrap">
                    <span>{companyAddress}</span>
                    <span className="hidden sm:inline">|</span>
                    <a href={`mailto:${companyEmail}`} className="text-brand-accent hover:underline">{companyEmail}</a>
                </div>
            </footer>
        </div>
    );
};

export default LoginPage;