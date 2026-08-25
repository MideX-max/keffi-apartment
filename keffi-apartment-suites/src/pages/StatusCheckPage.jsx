import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useReservations } from '../context/ReservationContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDatePass } from '../utils/constants.js';
import { Search, ShieldCheck, ArrowRight, Calendar, User, MapPin, AlertCircle, FileText } from 'lucide-react';

export default function StatusCheckPage() {
  const [searchParams] = useSearchParams();
  const { getReservationById } = useReservations();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (e, overrideQuery = query) => {
    if (e) e.preventDefault();
    const lookup = overrideQuery.trim();
    if (!lookup) {
      setError('Please enter a Pass ID');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const found = await getReservationById(lookup);
      setResult(found);
    } catch (err) {
      setError('Failed to look up reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getReservationById, query]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(null, q);
    }
  }, [handleSearch, searchParams]);

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh', padding: '4rem 0 6rem' }}>
      <div className="container-narrow">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--brand-gold-dark)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
            GATE ACCESS VERIFICATION
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Check Reservation &amp; Gate Pass Status
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            Enter your unique Reservation/Pass ID.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter Pass ID..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError('');
                }}
                style={{ height: '48px', fontSize: '1rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ height: '48px', flexShrink: 0 }}
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Check Status'}
            </button>
          </form>
          {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 600 }}>{error}</p>}
        </div>

        {/* Search Result */}
        {searched && (
          <div>
            {result ? (
              <div className="card" style={{ padding: '2.25rem', backgroundColor: '#ffffff', border: '2px solid var(--brand-black)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>RESERVATION IDENTIFIER</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--brand-black)', fontFamily: 'monospace' }}>
                      {result.passId}
                    </strong>
                  </div>
                  <StatusBadge status={result.status} size="lg" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>GUEST NAME</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--brand-black)' }}>{result.guestName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ALLOCATED FLAT</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--brand-black)' }}>{result.flat}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CHECK-IN DATE</span>
                    <strong>{formatDatePass(result.checkInDate)} ({result.checkInTime || '14:00'})</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CHECK-OUT DATE</span>
                    <strong>{formatDatePass(result.checkOutDate)} ({result.checkOutTime || '11:00'})</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    {result.status === 'Pending Review' 
                      ? '⚠️ Submission under review by Facility Manager.'
                      : '✅ Pass is active and authorized for gate entry.'}
                  </div>
                  <Link to={`/pass/${result.passId}`} className="btn btn-primary">
                    View &amp; Print Official Pass
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <AlertCircle size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.5rem' }}>
                  No Reservation Found
                </h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  We could not find any active or past reservation matching "<strong>{query}</strong>". Please check for typos or register a new guest.
                </p>
                <Link to="/register" className="btn btn-dark">
                  Register Guest Now
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
