import React, { useState } from 'react';
import { DatabaseIcon, EyeIcon, EyeSlashIcon, SpinnerIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';

const API_URL = '/api';

interface AppUser {
  username: string;
  role: 'admin' | 'user';
}

interface LoginPageProps {
  onLoginSuccess: (user: AppUser, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [companyName] = useLocalStorage('company-name', 'Data Collector Pro');
    const [companyLogo] = useLocalStorage<string | null>('company-logo', null);

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
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed. Please check your credentials.');
            }

            onLoginSuccess({ username: data.username, role: data.role }, data.token);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                     {companyLogo ? (
                        <img src={companyLogo} alt={`${companyName} Logo`} className="w-24 h-24 mx-auto object-contain"/>
                     ) : (
                        <DatabaseIcon className="w-24 h-24 mx-auto text-brand-accent"/>
                     )}
                     <h1 className="mt-4 text-3xl font-extrabold text-brand-light">{companyName}</h1>
                     <p className="text-brand-muted">Please log in to access the dashboard.</p>
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
                                required
                                className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-brand-light"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-brand-muted mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 pr-12 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-brand-light"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-brand-muted hover:text-brand-light"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-300 disabled:bg-brand-accent/50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Logging In...</>
                                ) : (
                                    'Log In'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                 <p className="mt-6 text-center text-xs text-brand-muted">
                    This is a secure system. All activities are logged.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
