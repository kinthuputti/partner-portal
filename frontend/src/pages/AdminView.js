import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllApplications, getByStatus, getCounts,
  approveApplication, rejectApplication, toggleCode
} from '../services/Api';
import axios from 'axios';
import toast from 'react-hot-toast';

const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const getCodesForApp = (appId) => {
  const token = localStorage.getItem('token');
  return axios.get(`http://localhost:8080/admin/codes/${appId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export default function AdminView() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [appCodes, setAppCodes] = useState({});

  const fetchCounts = useCallback(async () => {
    try { const res = await getCounts(); setCounts(res.data); } catch {}
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = activeTab === 'ALL' ? await getAllApplications() : await getByStatus(activeTab);
      const apps = res.data;
      setApplications(apps);
      const approvedApps = apps.filter(a => a.status === 'APPROVED');
      const codeMap = {};
      await Promise.all(approvedApps.map(async (app) => {
        try { const cr = await getCodesForApp(app.id); codeMap[app.id] = cr.data; }
        catch { codeMap[app.id] = []; }
      }));
      setAppCodes(codeMap);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchApplications(); fetchCounts(); }, [fetchApplications, fetchCounts]);

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await approveApplication(id);
      toast.success('Approved! Discount code created.');
      fetchApplications(); fetchCounts();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to approve'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return;
    setActionLoading(id + '-reject');
    try {
      await rejectApplication(id, rejectReason);
      toast.success('Application rejected.');
      setRejectingId(null); setRejectReason('');
      fetchApplications(); fetchCounts();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to reject'); }
    finally { setActionLoading(null); }
  };

  const handleToggle = async (codeId) => {
    setActionLoading('code-' + codeId);
    try {
      const res = await toggleCode(codeId);
      toast.success(`Code ${res.data.active ? 'activated' : 'deactivated'}!`);
      fetchApplications();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to toggle'); }
    finally { setActionLoading(null); }
  };

  const countFor = (tab) =>
    ({ ALL: counts.all, PENDING: counts.pending, APPROVED: counts.approved, REJECTED: counts.rejected })[tab] ?? 0;

  return (
    <div className="page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">Admin Panel</h2>
        <p className="section-sub">Review and manage partner applications.</p>
      </div>

      <div className="tabs">
        {TABS.map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="tab-count">{countFor(tab)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading...</div>
      ) : applications.length === 0 ? (
        <div className="card"><div className="empty"><div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>No {activeTab.toLowerCase()} applications.</div></div>
      ) : (
        applications.map(app => (
          <div className="app-card" key={app.id}>
            <div className="app-card-header">
              <div>
                <div className="app-card-title">{app.businessName}</div>
                <div className="app-card-sub">{app.userName} · {app.userEmail}</div>
              </div>
              <span className={`badge badge-${app.status.toLowerCase()}`}>
                {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
              </span>
            </div>

            <div className="app-card-meta">
              <span>🏷 {app.partnerType?.replace('_', ' ')}</span>
              {app.phone && <span>📞 {app.phone}</span>}
              {app.socialLink && <span>🔗 <a href={app.socialLink} target="_blank" rel="noreferrer" style={{ color: '#1a1a1a' }}>Link</a></span>}
              {app.audienceSize && <span>👥 {app.audienceSize.toLocaleString()}</span>}
              <span>📅 {new Date(app.appliedAt).toLocaleDateString('en-IN')}</span>
            </div>

            {app.description && <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1rem', lineHeight: 1.5 }}>{app.description}</p>}
            {app.rejectionReason && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><strong>Reason:</strong> {app.rejectionReason}</div>}

            {app.status === 'PENDING' && (
              <div>
                <div className="app-card-actions">
                  <button className="btn btn-success btn-sm" onClick={() => handleApprove(app.id)} disabled={actionLoading === app.id + '-approve'}>
                    {actionLoading === app.id + '-approve' ? 'Approving...' : '✓ Approve'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => { setRejectingId(app.id); setRejectReason(''); }} disabled={rejectingId === app.id}>
                    ✕ Reject
                  </button>
                </div>
                {rejectingId === app.id && (
                  <div className="reject-inline" style={{ marginTop: 10 }}>
                    <input type="text" placeholder="Reason for rejection (required)..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} autoFocus />
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(app.id)} disabled={!rejectReason.trim() || actionLoading === app.id + '-reject'}>
                      {actionLoading === app.id + '-reject' ? 'Rejecting...' : 'Confirm'}
                    </button>
                    <button className="btn btn-sm" style={{ background: '#f3f4f6', color: '#555' }} onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
                  </div>
                )}
              </div>
            )}

            {app.status === 'APPROVED' && (
              <div>
                <div className="divider" />
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Discount Codes</p>
                {(appCodes[app.id] || []).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#aaa' }}>No codes assigned yet.</p>
                ) : (
                  <div className="code-list">
                    {(appCodes[app.id] || []).map(code => (
                      <div className="code-item" key={code.id}>
                        <div className="code-value">{code.code}</div>
                        <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>{code.discountValue}</span>
                        <span className="code-meta">{code.usageCount} uses</span>
                        <span className={`badge ${code.active ? 'badge-active' : 'badge-inactive'}`}>{code.active ? 'Active' : 'Inactive'}</span>
                        <button className={`btn btn-sm ${code.active ? 'btn-outline' : 'btn-success'}`} onClick={() => handleToggle(code.id)} disabled={actionLoading === 'code-' + code.id}>
                          {actionLoading === 'code-' + code.id ? '...' : code.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}