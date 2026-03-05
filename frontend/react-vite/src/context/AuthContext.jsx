import { createContext, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const readStoredUser = () => {
    try {
        const raw = localStorage.getItem('auth_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);

    const login = async (username, password) => {
        const response = await api.post('auth/login/', { username, password });
        const { token, role, department } = response.data;
        localStorage.setItem('auth_token', token);
        const nextUser = { username, role, department };
        localStorage.setItem('auth_user', JSON.stringify(nextUser));
        setUser(nextUser);
        return nextUser;
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user && localStorage.getItem('auth_token')),
            login,
            logout,
        }),
        [user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
