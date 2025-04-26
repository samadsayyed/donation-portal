import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logoutUser } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in on mount
        const checkAuth = () => {
            if (isAuthenticated()) {
                setUser(getCurrentUser());
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        setUser: login,
        logout,
        isLoading,
        isAuthenticated: !!user
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or your loading component
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 