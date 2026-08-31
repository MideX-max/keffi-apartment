import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function GuestAccessLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const CENTRALIZED_PASSWORD = import.meta.env.VITE_GUEST_ACCESS_PASSWORD || 'keffiapartment';

  useEffect(() => {
    // Check if user is already authenticated for guest access
    const guestAuth = sessionStorage.getItem('guestAuthenticated');
    if (guestAuth === 'true') {
      navigate('/register');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the access password.');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === CENTRALIZED_PASSWORD) {
      // Set authentication in session storage
      sessionStorage.setItem('guestAuthenticated', 'true');
      navigate('/register');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-surface)',
      padding: '3rem 1.5rem'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        {/* Card */}
        <div className="card" style={{ padding: '2.75rem 2.25rem', backgroundColor: '#ffffff', border: '2px solid var(--brand-black)', boxShadow: 'var(--shadow-lg)' }}>
          
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
              <Logo height={68} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.01em', marginBottom: '0.35rem' }}>
              Guest Registration Access
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
              Enter the access password to register a new guest.
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#dc2626',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Access Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter access password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  autoFocus
                />
                <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
            >
              {loading ? 'Verifying...' : 'Access Registration'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: 'var(--bg-surface)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--brand-gold-dark)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-black)' }}>
                Secure Access Control
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              This area is restricted to authorized apartment managers only.
            </p>
          </div>

        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            style={{ fontSize: '0.875rem', color: 'var(--text-sub)', fontWeight: 600 }}
          >
            &larr; Return to Home
          </a>
        </div>

      </div>
    </div>
  );
}
