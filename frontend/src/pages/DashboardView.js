import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function DashboardView({ dashboard }) {
  const { application, codes, totalCodes, totalUsage, totalDiscountGiven } = dashboard;
  const [copiedId, setCopiedId] = useState(null);

  const approvedDate = application?.reviewedAt
    ? new Date(application.reviewedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      toast.success(`Copied ${code}!`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">Partner Dashboard</h2>
            <p style={{ color: '#888', fontSize: '0.88rem', marginTop: 4 }}>
              {application?.partnerType?.replace('_', ' ')} · Approved {approvedDate}
            </p>
          </div>
          <span className="badge badge-approved">✓ Approved</span>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{totalCodes}</div>
            <div className="stat-label">Total Codes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalUsage}</div>
            <div className="stat-label">Total Uses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalDiscountGiven.toFixed(0)}</div>
            <div className="stat-label">Discount Given</div>
          </div>
        </div>
      </div>

      {/* Codes */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Your Discount Codes</h3>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
          Share these codes with your audience to track usage.
        </p>

        {codes.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎟️</div>
            <p>No discount codes assigned yet.</p>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
              Your codes will appear here once the admin assigns them.
            </p>
          </div>
        ) : (
          <div className="code-list">
            {codes.map((code) => {
              const expiry = code.expiryDate
                ? new Date(code.expiryDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                : null;
              const isExpired = code.expiryDate && new Date(code.expiryDate) < new Date();

              return (
                <div className="code-item" key={code.id}
                  style={{ opacity: isExpired ? 0.6 : 1 }}>
                  <div className="code-value">{code.code}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#16a34a' }}>
                      {code.discountValue}
                    </span>
                    <span className="code-meta">{code.usageCount} uses</span>
                    {expiry && (
                      <span className="code-meta" style={{ color: isExpired ? '#dc2626' : '#888' }}>
                        {isExpired ? '⚠ Expired' : `Expires ${expiry}`}
                      </span>
                    )}
                  </div>

                  <span className={`badge ${code.active ? 'badge-active' : 'badge-inactive'}`}>
                    {code.active ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => copyCode(code.code, code.id)}
                  >
                    {copiedId === code.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}