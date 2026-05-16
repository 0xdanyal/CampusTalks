import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

export const Signup = () => {
  const [formData, setFormData] = useState({
    regNo: '',
    name: '',
    department: '',
    batch: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await signup(formData);
    
    if (result.success) {
      setSuccess('Account created! Please wait for admin approval before logging in.');
      setTimeout(() => navigate('/login'), 4000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus size={28} className="auth-icon" />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the CampusTalks community</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="auth-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label className="input-label" htmlFor="regNo">Registration No.</label>
              <input
                id="regNo"
                name="regNo"
                type="text"
                className="input-field"
                placeholder="FA21-BSE-001"
                value={formData.regNo}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <label className="input-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label" htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                className="input-field"
                placeholder="BSE"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <label className="input-label" htmlFor="batch">Batch</label>
              <input
                id="batch"
                name="batch"
                type="text"
                className="input-field"
                placeholder="FA21"
                value={formData.batch}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input-field"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="input-field"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading || success}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};
