import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in when app starts
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if user data is stored in localStorage
                const storedUser = localStorage.getItem('currentUser');

                if (storedUser) {
                    // Verify token is still valid by making a test API call
                    try {
                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/verify`, {
                            method: 'GET',
                            credentials: 'include', // Send cookies
                        });

                        if (response.ok) {
                            // Token is valid
                            setUser(storedUser);
                            setIsAuthenticated(true);
                            // console.log('✅ User authenticated:', storedUser);
                            console.log('✅ User authenticated:');
                        } else {
                            // Token expired or invalid
                            console.log('⚠️ Token expired, logging out...');
                            localStorage.removeItem('currentUser');
                            setUser(null);
                            setIsAuthenticated(false);
                        }
                    } catch (error) {
                        // API call failed, assume token expired
                        console.log('⚠️ Auth verification failed, logging out...');
                        localStorage.removeItem('currentUser');
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } else {
                    // No user logged in
                    setUser(null);
                    setIsAuthenticated(false);
                    // console.log('ℹ️ No user logged in');
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (username = null) => {
        // Store user data in localStorage
        localStorage.setItem('currentUser', username);


        setUser(username);
        setIsAuthenticated(true);

        // console.log('✅ User logged in:', username);
    };

    const logout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('currentUser');

        setUser(null);
        setIsAuthenticated(false);

        // console.log('✅ User logged out');
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};