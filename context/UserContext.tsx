import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, verifyStoredSession, getCurrentUserRole, getCurrentUserDisplayName, getCurrentUserCode, logout as authLogout } from '../services/authService';

interface UserContextType {
    role: UserRole;
    displayName: string;
    userCode: string;
    loading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [role, setRole] = useState<UserRole>(null);
    const [displayName, setDisplayName] = useState('');
    const [userCode, setUserCode] = useState('');
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        setLoading(true);
        try {
            const { role: verifiedRole, valid } = await verifyStoredSession();
            if (valid) {
                setRole(verifiedRole);
                setDisplayName(getCurrentUserDisplayName());
                setUserCode(getCurrentUserCode());
            } else {
                setRole(null);
                setDisplayName('');
                setUserCode('');
            }
        } catch (e) {
            console.error('Failed to verify session', e);
            // Trust stored values on error to allow offline mode
            setRole(getCurrentUserRole());
            setDisplayName(getCurrentUserDisplayName());
            setUserCode(getCurrentUserCode());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const logout = () => {
        authLogout();
        setRole(null);
        setDisplayName('');
        setUserCode('');
    };

    return (
        <UserContext.Provider value={{
            role,
            displayName,
            userCode,
            loading,
            logout,
            refreshUser,
            isAuthenticated: !!role
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
