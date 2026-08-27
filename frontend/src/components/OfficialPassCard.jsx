import React, { forwardRef } from 'react';
import Logo from './Logo.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatDatePass } from '../utils/constants.js';
import { BRAND, DEFAULT_MANAGER_SIG } from '../utils/constants.js';

const OfficialPassCard = forwardRef(function OfficialPassCard({ reservation, className = '' }, ref) {
  if (!reservation) {
    return (
      <div className="card p-8 text-center text-gray-500">
        No reservation details available.
      </div>
    );
  }

  const {
    passId,
    guestName,
    flat,
    checkInDate,
    checkOutDate,
    checkInTime = "14:00",
    checkOutTime = "11:00",
    signatureUrl,
    managerSignatureUrl,
    status = "Approved",
    createdAt
  } = reservation;

  const isExpired = status?.toLowerCase() === 'expired';

  return (
    <div 
      ref={ref} 
      className={`kas-pass-paper pass-printable-container ${className}`}
      id="kas-official-guest-pass"
      style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '2px solid #111111',
        padding: '3rem 2.75rem 2.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        maxWidth: '740px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        color: '#111111'
      }}
    >
      {/* Decorative Corner Sunburst Accents matching physical reference */}
      <img src="/corner-accent.svg" alt="" className="pass-corner-accent pass-corner-tl" />
      <img src="/corner-accent.svg" alt="" className="pass-corner-accent pass-corner-tr" />
      <img src="/corner-accent.svg" alt="" className="pass-corner-accent pass-corner-bl" />
      <img src="/corner-accent.svg" alt="" className="pass-corner-accent pass-corner-br" />

      {/* Expired Watermark if status is Expired */}
      {isExpired && (
        <div className="pass-expired-watermark">
          EXPIRED
        </div>
      )}

      {/* 1. Header: KS Logo Centered */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <img
          src="/logo.png"
          alt="KEFFI APARTMENT SUITES"
          style={{
            height: '92px',
            width: 'auto',
            margin: '0 auto 0.5rem',
            display: 'block',
            objectFit: 'contain'
          }}
        />
        <h1 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#000000',
          margin: '0.25rem 0',
          lineHeight: '1.3'
        }}>
          KEFFI APARTMENT SUITES GUEST RESERVATION
        </h1>
        <p style={{
          fontSize: '1rem',
          fontWeight: 500,
          color: '#262626',
          margin: '0'
        }}>
          The details of your reservation for access into the Estate:
        </p>
      </div>

      {/* 2. Dotted Field Lines matching physical reference */}
      <div style={{ margin: '2rem 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        
        {/* NAME Field */}
        <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '1.15rem', position: 'relative' }}>
          <span style={{ fontWeight: 800, color: '#000000', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            NAME:
          </span>
          <div style={{
            flex: 1,
            marginLeft: '0.5rem',
            borderBottom: '2px dotted #444444',
            minHeight: '32px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              position: 'absolute',
              bottom: '2px',
              fontWeight: 700,
              fontSize: '1.35rem',
              color: '#000000'
            }}>
              {guestName || "—"}
            </span>
          </div>
        </div>

        {/* FLAT NO Field */}
        <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '1.15rem', position: 'relative' }}>
          <span style={{ fontWeight: 800, color: '#000000', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            FLAT NO:
          </span>
          <div style={{
            flex: 1,
            marginLeft: '0.5rem',
            borderBottom: '2px dotted #444444',
            minHeight: '32px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              position: 'absolute',
              bottom: '2px',
              fontWeight: 700,
              fontSize: '1.35rem',
              color: '#000000'
            }}>
              {flat || "—"}
            </span>
          </div>
        </div>

        {/* START DATE & END DATE Field */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          {/* Start Date */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', fontSize: '1.1rem' }}>
            <span style={{ fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              START DATE:
            </span>
            <div style={{
              flex: 1,
              marginLeft: '0.4rem',
              borderBottom: '2px dotted #444444',
              minHeight: '30px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                position: 'absolute',
                bottom: '2px',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#000000'
              }}>
                {formatDatePass(checkInDate)}
              </span>
            </div>
          </div>

          {/* End Date */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', fontSize: '1.1rem' }}>
            <span style={{ fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              END DATE:
            </span>
            <div style={{
              flex: 1,
              marginLeft: '0.4rem',
              borderBottom: '2px dotted #444444',
              minHeight: '30px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                position: 'absolute',
                bottom: '2px',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#000000'
              }}>
                {formatDatePass(checkOutDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Guest / Flat Owner Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', color: '#000000', letterSpacing: '0.02em' }}>
              FLAT OWNERS/REPRESENTATIVE’S SIGNATURE :
            </span>
            <div style={{
              borderBottom: '2px dotted #444444',
              minHeight: '65px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Guest Signature"
                  style={{ maxHeight: '60px', maxWidth: '240px', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#888888', fontStyle: 'italic' }}>
                  (Digitally Verified Submission)
                </span>
              )}
            </div>
          </div>

          {/* Facility Manager's Signature */}
          <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '1.05rem' }}>
            <span style={{ fontWeight: 800, textTransform: 'uppercase', color: '#000000', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
              FACILITY MANAGER’S SIGNATURE:
            </span>
            <div style={{
              flex: 1,
              marginLeft: '0.5rem',
              borderBottom: '2px dotted #444444',
              minHeight: '65px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <img
                src={managerSignatureUrl || DEFAULT_MANAGER_SIG}
                alt="Facility Manager Signature"
                style={{ maxHeight: '60px', maxWidth: '240px', objectFit: 'contain' }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* 3. Official Bottom Notice matching physical reference pass */}
      <div style={{
        marginTop: '1.75rem',
        paddingTop: '1.25rem',
        borderTop: '1.5px solid #d1d5db',
        fontSize: '0.925rem',
        lineHeight: '1.45',
        color: '#1a1a1a'
      }}>
        <div>
          <span style={{ fontWeight: 800, color: '#000000' }}>NB:</span> Access into the premises will only be granted after the form has been properly filled and signed by management.
        </div>
        <div style={{ fontStyle: 'italic', marginTop: '0.35rem', fontWeight: 500 }}>
          Upon expiration, the gate pass can no longer be used.
        </div>
      </div>

      {/* 4. Digital Security Metadata Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.25rem',
        paddingTop: '0.85rem',
        borderTop: '1px dashed #cbd5e1',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>PASS ID:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e293b', fontSize: '0.85rem' }}>
            {passId || "KAS-GEN-0000"}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#475569' }}>
            Check-in: <strong>{checkInTime}</strong> | Check-out: <strong>{checkOutTime}</strong>
          </span>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

    </div>
  );
});

export default OfficialPassCard;
