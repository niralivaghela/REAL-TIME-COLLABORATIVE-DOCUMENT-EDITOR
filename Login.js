import React, { useState } from 'react';

const Login = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim()) {
      alert('Please enter both username and email');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email: email.trim() })
      });
      
      if (response.ok) {
        const userData = await response.json();
        onLogin(userData);
      } else {
        alert('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Auto login for demo
      onLogin({ username: username.trim(), email: email.trim(), _id: Date.now().toString() });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLogin({ username: 'Demo User', email: 'demo@collabspace.com', _id: 'demo123' });
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid var(--border)', 
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        ← Back to Home
      </button>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          fontSize: '2rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          🚀
        </div>
        
        <h1 style={{ 
          marginBottom: '0.5rem', 
          fontSize: '2rem', 
          fontWeight: '700',
          color: 'var(--text-primary)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          CollabSpace Pro
        </h1>
        
        <p style={{ 
          marginBottom: '2rem', 
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          Professional collaboration platform for teams
        </p>
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
            Sign In
          </button>
          
          <button 
            type="button" 
            onClick={handleDemoLogin}
            className="btn btn-secondary" 
            style={{ width: '100%' }}
          >
            Quick Demo Access
          </button>
        </form>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>✨ Features</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <div>📝 Rich Text Editor</div>
            <div>🎨 Collaborative Whiteboard</div>
            <div>📊 Analytics Dashboard</div>
            <div>💬 Real-time Chat</div>
            <div>🤖 AI Assistant</div>
            <div>📋 Project Management</div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;