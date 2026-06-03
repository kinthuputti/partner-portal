import React from 'react';

export default function RejectedView({ application, onReapply }) {
  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 className="section-title">Application Not Approved</h2>
        <p style={{ color: '#666', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Unfortunately your application wasn't approved this time.
          You're welcome to update your details and reapply.
        </p>

        {application?.rejectionReason && (
          <div className="alert alert-error" style={{ textAlign: 'left', margin: '1.5rem 0' }}>
            <strong>Reason given:</strong>
            <p style={{ marginTop: 4 }}>{application.rejectionReason}</p>
          </div>
        )}

        <div style={{
          background: '#f9f9f7', border: '1.5px solid #ececec',
          borderRadius: 10, padding: '1.2rem', margin: '1rem 0', textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Business</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{application?.businessName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Partner Type</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {application?.partnerType?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '0.5rem' }}
          onClick={onReapply}
        >
          Update & Reapply →
        </button>
      </div>
    </div>
  );
}