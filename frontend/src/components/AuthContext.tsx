import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { AuthUser, AuthRequest } from '../types';

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    login: (request: AuthRequest) => Promise<void>;
    register: (request: AuthRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        authApi
            .me()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (request: AuthRequest) => {
        const loggedInUser = await authApi.login(request);
        setUser(loggedInUser);
    };

    const register = async (request: AuthRequest) => {
        const registeredUser = await authApi.register(request);
        setUser(registeredUser);
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
