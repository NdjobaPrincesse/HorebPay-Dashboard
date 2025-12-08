import React, { useState, useRef, useEffect } from 'react';
import './Login.css';

interface LoginFormProps {
  onLoginSuccess?: (username: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const usernameRef = useRef<HTMLInputElement>(null);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 300000; 

  useEffect(() => {
    // Focus username input on mount
    usernameRef.current?.focus();
    
    // Check for existing lockout
    const lockoutUntil = localStorage.getItem('lockoutUntil');
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
      const remaining = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 1000 / 60);
      setError(`Account locked. Try again in ${remaining} minutes.`);
    }
  }, []);

  const validateInputs = () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return false;
    }
    
    // Basic input sanitization
    const usernameRegex = /^[a-zA-Z0-9_@.-]+$/;
    if (!usernameRegex.test(username)) {
      setError('Invalid characters in username');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  };

  const simulateAPICall = async (user: string, pass: string) => {
    
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      setTimeout(() => {
        // Simulate validation - In production, this happens on the server
        const validCredentials = 
          user === 'admin' && pass === 'admin@1234'; 
        
        resolve({
          success: validCredentials,
          message: validCredentials 
            ? 'Login successful' 
            : 'Invalid credentials'
        });
      }, 1500); // Simulate network delay
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check lockout
    const lockoutUntil = localStorage.getItem('lockoutUntil');
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
      const remaining = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 1000 / 60);
      setError(`Account locked. Try again in ${remaining} minutes.`);
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const response = await simulateAPICall(username, password);
      
      if (response.success) {
        // Reset attempts on successful login
        setAttempts(0);
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutUntil');
        
        // Clear password field for security
        setPassword('');
        
        // Trigger success callback with username
        onLoginSuccess?.(username);
        
        alert('Login successful!');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());
        
        if (newAttempts >= MAX_ATTEMPTS) {
            const lockoutTime = Date.now() + LOCKOUT_TIME;
            localStorage.setItem('lockoutUntil', lockoutTime.toString());
            setError('Too many failed attempts. Account locked for 5 minutes.');
        } else {
            setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch (err) {  
      setError('Network error. Please try again.');
      
      console.error('Login error:', err);
    } finally {  
      setLoading(false);
    }
  };

  return (
    <div className="login-container" role="main" aria-label="Login form">
      <div className="login-card">
        <div className="login-header">
          <h1 className="logo">HOREB</h1>
          <div className="line">    </div><br/>
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Login to continue</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="login-form"
          autoComplete="on"
          aria-label="Login form"
        >
          <div className="form-group">
            <label htmlFor="username" className="form-label">
            </label>
            <input
              placeholder='Username'
              ref={usernameRef}
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              disabled={loading}
              autoComplete="username"
              aria-required="true"
              aria-label="Username"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <div className="password-label-container">
              <label htmlFor="password" className="form-label">
              </label>
            </div>
              <input
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
                disabled={loading}
                placeholder='Password'
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                autoComplete="current-password"
                aria-required="true"
                minLength={8}
                maxLength={100}
                onClick={() => setShowPassword(!showPassword)}
              />
           
            <div className="password-strength" aria-live="polite">
              {password.length > 0 && password.length < 8 && (
                <span className="strength-weak">Weak password</span>
              )}
              {password.length >= 8 && (
                <span className="strength-ok">Password meets minimum length</span>
              )}
            </div>
          </div>
          
          {error ? (
            <div
              className="error-message"
              role="alert"
              aria-live="assertive"
            > 
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="login-button"
            disabled={loading || !username || !password}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;