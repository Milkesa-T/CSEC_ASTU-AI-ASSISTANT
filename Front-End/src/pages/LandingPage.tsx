import { ArrowRight, BookOpen, Cpu, Linkedin, Send, Shield, Youtube } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ChatWidget from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="landing-page" style={{ height: '100vh', overflowY: 'auto', scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      <nav className="glass-nav" style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 5%', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)'
      }}>
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/csec-logo-black.jpg" alt="CSEC ASTU" style={{ height: '40px' }} />
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>CSEC ASTU</h2>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none' }}>Features</a>
          <a href="#about" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none' }}>About</a>
          {isAuthenticated ? (
            <>
              {user?.is_admin && <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Admin Panel</Button>}
              <Button size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>Login</Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" style={{ 
        padding: '160px 5% 100px', textAlign: 'center', 
        background: 'radial-gradient(circle at 50% 50%, hsla(var(--primary), 0.05) 0%, transparent 70%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        {/* Animated Hero Logo */}
        <div className="hero-logo-container" style={{ marginBottom: '2rem' }}>
          <img 
            src="/csec-logo-black.jpg" 
            alt="CSEC Logo" 
            className="floating-logo"
            style={{ 
              height: '120px', 
              borderRadius: '30px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              border: '2px solid var(--glass-border)'
            }} 
          />
        </div>

        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
          The Intelligence Hub for <br />
          <span style={{ color: 'hsl(var(--primary))' }}>CSEC ASTU Excellence</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'hsl(var(--text-secondary))', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
          Access CSEC_ASTU Lab knowledges instantly throught AI assistant. Powered by advanced RAG technology to provide accurate answers from official documents.
          This assistant supports CSEC_ASTU-wide knowledge and provides some information about the Adma Science and Technology University.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button size="lg" onClick={() => document.getElementById('features')?.scrollIntoView()}>
            Explore Features <ArrowRight size={20} />
          </Button>
          <Button variant="outline" size="lg">
            Research Portal
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '100px 10%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>Why CSEC ASTU Intelligence?</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          <FeatureCard 
            icon={<Shield color="hsl(var(--primary))" />} 
            title="Cybersecurity" 
            desc="Expert advice on network security, ethical hacking, and digital forensics."
          />
          <FeatureCard 
            icon={<Cpu color="hsl(var(--primary))" />} 
            title="Development & AI" 
            desc="Guidance on software engineering, data science, and AI lab activities."
          />
          <FeatureCard 
            icon={<BookOpen color="hsl(var(--primary))" />} 
            title="Competative" 
            desc="Resources for competitive programming and algorithm optimization."
          />
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ padding: '100px 10%', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Empowering Communities. Securing the Future</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.8, marginBottom: '2rem' }}>
              CSEC_ASTU is committed to being a center of excellence in cybersecurity, data science, development, and competative programming. 
              This AI assistant is part of our digital transformation initiative, designed to provide our academic and research community 
              with instant, reliable, and intelligent access to information about our lab activities, research projects, and services.
            </p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '2rem', color: 'hsl(var(--primary))', margin: 0 }}>4+</h3>
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Divisions</p>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', color: 'hsl(var(--accent-green))', margin: 0 }}>5000+</h3>
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Active Communities</p>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
             <img 
               src="/csec-logo-white.jpg" 
               alt="CSEC" 
               style={{ width: '80%', opacity: 0.2, filter: 'grayscale(0)' }} 
             />
          </div>
        </div>
      </section>

      {/* Chat Bot Widget */}
      <ChatWidget />
      
      {/* Footer */}
      <footer style={{ padding: '4rem 10%', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <a href="https://www.linkedin.com/company/csec-astu" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--text-secondary))', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'hsl(var(--primary))'} onMouseOut={(e) => e.currentTarget.style.color = 'hsl(var(--text-secondary))'}>
            <Linkedin size={24} />
          </a>
          <a href="https://t.me/CSEC_ASTU" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--text-secondary))', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'hsl(var(--primary))'} onMouseOut={(e) => e.currentTarget.style.color = 'hsl(var(--text-secondary))'}>
            <Send size={24} />
          </a>
          <a href="https://youtube.com/@csec_cbd?si=Ff_0E6aGhDi21t0E" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--text-secondary))', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'hsl(var(--primary))'} onMouseOut={(e) => e.currentTarget.style.color = 'hsl(var(--text-secondary))'}>
            <Youtube size={24} />
          </a>
        </div>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
          &copy; 2026 CSEC ASTU. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="glass-effect" style={{ padding: '2.5rem', borderRadius: '24px' }}>
    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', width: 'fit-content', padding: '1rem', borderRadius: '16px' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>
  </div>
);

export default LandingPage;
<style>
{`
  @keyframes float-logo {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  .floating-logo {
    animation: float-logo 4s ease-in-out infinite;
  }
  .glass-nav {
    animation: slideDown 0.5s ease-out;
  }
  @keyframes slideDown {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }
`}
</style>
