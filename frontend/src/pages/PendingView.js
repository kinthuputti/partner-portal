import React from 'react';

export default function PendingView({ application }) {
  const appliedDate = application?.appliedAt
    ? new Date(application.appliedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2 className="section-title">Application Under Review</h2>
        <p style={{ color: '#666', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Thanks for applying! Our team is reviewing your application and will
          get back to you within a few business days.
        </p>

        <div style={{
          background: '#f9f9f7', border: '1.5px solid #ececec',
          borderRadius: 10, padding: '1.2rem', margin: '1.5rem 0', textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Business</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{application?.businessName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Partner Type</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {application?.partnerType?.replace('_', ' ')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Applied On</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{appliedDate}</span>
          </div>
        </div>

        <div className="alert alert-info" style={{ textAlign: 'left' }}>
          💡 You'll see your dashboard here once you're approved. No action needed right now.
        </div>
      </div>
    </div>
  );
}