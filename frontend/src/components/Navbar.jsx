import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 0',
      marginBottom: '2rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center gap-2"
          style={{ 
            fontSize: '1.4rem', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}
        >
          <GraduationCap size={28} color="#8b5cf6" style={{ flexShrink: 0 }} />
          CampusTalks
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            {user.role === 'admin' && (
              <Link to="/admin" className="text-secondary hide-on-mobile" style={{ fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Admin Dashboard
              </Link>
            )}
            <Link 
              to="/profile" 
              className="flex items-center gap-2 text-secondary"
              style={{ fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <UserIcon size={18} />
              <span className="hide-on-mobile" style={{ fontWeight: 500 }}>{user.name}</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="btn btn-secondary action-sm"
              style={{ padding: '0.4rem 0.8rem', gap: '0.4rem' }}
            >
              <LogOut size={16} />
              <span className="hide-on-mobile">Logout</span>
            </button>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 600px) {
          .hide-on-mobile { display: none; }
        }
      `}</style>
    </nav>
  );
};
