import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        await axios.post(`${API_BASE_URL}/signup`, null, {
          params: { username, email, password }
        });
        setIsSignup(false);
        alert('Sign up successful! Please verify your email to login.');
      } else {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const res = await axios.post(`${API_BASE_URL}/login`, formData);
        login(res.data.access_token, res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/csec-logo-black.jpg" alt="CSEC ASTU Logo" style={{ height: '80px', marginBottom: '1rem' }} />
          <h2 style={{ margin: 0 }}>{isSignup ? "Create Account" : "Login to CSEC ASTU KB"}</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            className="glass-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {isSignup && (
            <input
              className="glass-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <input
            className="glass-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" isLoading={loading}>
            {isSignup ? "Sign Up" : "Login"}
          </Button>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
            <span 
              onClick={() => setIsSignup(!isSignup)} 
              style={{ color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 600 }}
            >
              {isSignup ? "Login" : "Sign up"}
            </span>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
