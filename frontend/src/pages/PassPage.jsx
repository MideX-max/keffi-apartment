import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReservations } from '../context/ReservationContext.jsx';
import OfficialPassCard from '../components/OfficialPassCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { generatePassPDF } from '../utils/pdfGenerator.js';
import { formatDatePass } from '../utils/constants.js';
import { 
  Download, Printer, Share2, Check, ArrowLeft, ShieldCheck, 
  AlertTriangle, Copy, ExternalLink, Calendar, MapPin, Building 
} from 'lucide-react';

export default function PassPage() {
  const { passId } = useParams();
  const navigate = useNavigate();
  const { getReservationById } = useReservations();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const passCardRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      if (!passId) return;
      setLoading(true);
      try {
        const data = await getReservationById(passId);
        setReservation(data);
      } catch (err) {
        console.error('Failed to load pass:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [passId, getReservationById]);

  const handleDownloadPDF = async () => {
    if (!reservation) return;
    setDownloading(true);
    try {
      const filename = `KEFFI_APARTMENT_PASS_${reservation.passId}.pdf`;
      await generatePassPDF('kas-official-guest-pass', filename);
    } catch (err) {
      alert('Failed to generate PDF. Please try using the Print button.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--brand-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>Retrieving Official Gate Pass...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Validating pass security credentials</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-surface)', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.75rem' }}>
            Gate Pass Not Found
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            No reservation or gate pass was found matching ID: <strong>{passId}</strong>. Please ensure the pass ID is correct or contact the facility manager.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/status" className="btn btn-outline">
              Try Another ID
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register New Guest
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = reservation.status === 'Approved' || reservation.status === 'Active' || reservation.status === 'Upcoming';
  const isPending = reservation.status === 'Pending Review';
  const isExpired = reservation.status === 'Expired';

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh', padding: '3.5rem 0 5rem' }}>
      <div className="container">
        
        {/* Back Link */}
        <div className="no-print" style={{ marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-black)', fontWeight: 600, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} />
            Back to Estate Home
          </Link>
        </div>

        {/* Confirmation Status Banner */}
        <div className="no-print" style={{
          backgroundColor: isApproved ? '#f0fdf4' : (isPending ? '#fffbeb' : (isExpired ? '#f3f4f6' : '#fef2f2')),
          border: `1.5px solid ${isApproved ? '#bbf7d0' : (isPending ? '#fde68a' : '#d1d5db')}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                {isApproved ? 'Reservation Approved & Verified' : (isPending ? 'Reservation Requires Management Review' : `Reservation Status: ${reservation.status}`)}
              </h1>
              <StatusBadge status={reservation.status} size="md" />
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem' }}>
              Guest: <strong>{reservation.guestName}</strong> • Suite: <strong>{reservation.flat}</strong> • Stay: <strong>{formatDatePass(reservation.checkInDate)} &rarr; {formatDatePass(reservation.checkOutDate)}</strong>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="pass-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="btn btn-primary"
            >
              <Download size={18} />
              {downloading ? 'Exporting PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-dark"
            >
              <Printer size={18} color="var(--brand-gold)" />
              Print Pass
            </button>
          </div>
        </div>

        {/* The Official Gate Pass Replica Card */}
        <div style={{ marginBottom: '3rem' }}>
          <OfficialPassCard ref={passCardRef} reservation={reservation} />
        </div>

        {/* Security & Gate Entry Instructions */}
        <div className="no-print" style={{ maxWidth: '740px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1.5px solid var(--border-medium)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-black)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldCheck size={20} color="var(--brand-gold-dark)" />
              Estate Gate Entry Instructions
            </h3>
            
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
              <li>
                <strong>Gatehouse Presentation:</strong> Please present this official pass on your mobile device or as a printed copy to security officers at the main gate.
              </li>
              <li>
                <strong>Verification:</strong> Security will verify the <strong>Pass ID ({reservation.passId})</strong> and match with the physical identification on file.
              </li>
              <li>
                <strong>Validity:</strong> Pass is active strictly from <strong>{formatDatePass(reservation.checkInDate)} ({reservation.checkInTime || '14:00'})</strong> to <strong>{formatDatePass(reservation.checkOutDate)} ({reservation.checkOutTime || '11:00'})</strong>.
              </li>
              <li>
                <strong>Support:</strong> If you experience any delay, contact the Facility Manager at <strong>+234 800 533 3442</strong>.
              </li>
            </ul>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Pass ID: <strong style={{ fontFamily: 'monospace', color: 'var(--brand-black)' }}>{reservation.passId}</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/register" className="btn btn-outline btn-sm">
                  Register Another Guest
                </Link>
                <Link to="/" className="btn btn-dark btn-sm">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
