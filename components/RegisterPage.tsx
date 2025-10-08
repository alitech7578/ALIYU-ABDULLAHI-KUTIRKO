import React, { useState } from 'react';
import { UserPlusIcon } from './IconComponents';

const API_URL = 'http://localhost:3001/api';

interface RegisterPageProps {
    token: string;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ token }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(`User "${username}" created successfully with role "${role}"!`);
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setRole('user');

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
                     <UserPlusIcon className="w-24 h-24 mx-auto text-brand-accent"/>
                     <h1 className="mt-4 text-3xl font-extrabold text-brand-light">Register New User</h1>
                     <p className="text-brand-muted">Create a new account with the 'user' or 'admin' role.</p>
                </div>
                <div className="bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-brand-muted mb-2">
                                New Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-brand-light"
                            />
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-brand-muted mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-brand-light"
                            />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-muted mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-brand-light"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-brand-muted mb-2">
                                Role
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                                required
                                className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-brand-light"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        {success && <p className="text-green-400 text-sm text-center">{success}</p>}
                        
                        <div className="flex items-center gap-4 pt-2">
                             <a href="#/" className="w-full flex justify-center py-3 px-4 border border-brand-muted/50 rounded-lg text-sm font-medium text-brand-muted hover:bg-brand-muted/10 transition-colors">
                                Back to Dashboard
                             </a>
                             <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-300 disabled:bg-brand-accent/50 disabled:cursor-not-allowed"
                                >
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;