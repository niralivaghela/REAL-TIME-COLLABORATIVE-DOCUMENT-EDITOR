import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🚀</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>CollabSpace Pro</h1>
        </div>
        <button 
          onClick={onGetStarted}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          marginBottom: '1rem',
          maxWidth: '800px'
        }}>
          The Future of Team Collaboration
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          opacity: 0.9,
          maxWidth: '600px'
        }}>
          Experience next-generation document collaboration with real-time editing, 
          AI assistance, and powerful project management tools.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
          <button 
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
              border: 'none',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            🚀 Start Collaborating
          </button>
          <button style={{
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            📺 Watch Demo
          </button>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          width: '100%'
        }}>
          {[
            { icon: '📝', title: 'Rich Text Editor', desc: 'Professional document editing with templates' },
            { icon: '⚡', title: 'Real-time Sync', desc: 'Collaborate instantly with your team' },
            { icon: '🤖', title: 'AI Assistant', desc: 'Smart writing suggestions and improvements' },
            { icon: '📊', title: 'Analytics', desc: 'Track productivity and team insights' }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                {feature.title}
              </h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
          © 2024 CollabSpace Pro. Built for modern teams.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;