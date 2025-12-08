import React, { useState, useEffect } from 'react';
import LoginForm from './assets/components/Login.tsx';
import Dashboard from './assets/components/Dashboard.tsx';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const savedAuth = localStorage.getItem('isAuthenticated');
        const savedUsername = localStorage.getItem('username');

        if (savedAuth === 'true' && savedUsername) {
            setIsLoggedIn(true);
            setUsername(savedUsername);
        }
    }, []); // <- Fixed: Empty dependency array

    const handleLoginSuccess = (loggedInUsername: string) => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', loggedInUsername);
        setUsername(loggedInUsername);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUsername('');
    };

    return (
        <div className="app">
            {isLoggedIn ? (
                <Dashboard 
                    username={username} 
                    onLogout={handleLogout} 
                />
            ) : (
                <LoginForm 
                    onLoginSuccess={handleLoginSuccess} 
                />
            )}
        </div>
    );
};

export default App;
