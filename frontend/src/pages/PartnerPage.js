import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyApplication, getDashboard } from '../services/Api';

import VisitorView from './VisitorView';
import ApplicationForm from './ApplicationForm';
import PendingView from './PendingView';
import RejectedView from './RejectedView';
import DashboardView from './DashboardView';
import AdminView from './AdminView';

export default function PartnerPage() {
  const { user } = useAuth();
  const [view, setView] = useState('loading');
  const [application, setApplication] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [isReapply, setIsReapply] = useState(false);

  const loadUserState = useCallback(async () => {
    if (!user) { setView('visitor'); return; }
    if (user.role === 'ADMIN') { setView('admin'); return; }

    try {
      const res = await getMyApplication();

      if (res.status === 204) {
        setView('apply');
        return;
      }

      const app = res.data;
      setApplication(app);

      if (app.status === 'PENDING') {
        setView('pending');
      } else if (app.status === 'REJECTED') {
        setView('rejected');
      } else if (app.status === 'APPROVED') {
        const dash = await getDashboard();
        setDashboard(dash.data);
        setView('dashboard');
      }
    } catch (err) {
      if (err.response?.status === 204 || err.response?.status === 404) {
        setView('apply');
      } else {
        setView('apply');
      }
    }
  }, [user]);

  useEffect(() => {
    // Reset to loading whenever user changes (login/logout/register)
    setView('loading');
    loadUserState();
  }, [loadUserState]);

  // Visitor
  if (!user) return <VisitorView />;

  // Admin
  if (user.role === 'ADMIN') return <AdminView />;

  // Loading
  if (view === 'loading') {
    return (
      <div className="loading">
        <div className="spinner" /> Loading your account...
      </div>
    );
  }

  // Apply (new or reapply)
  if (view === 'apply') {
    return (
      <ApplicationForm
        isReapply={isReapply}
        prefill={isReapply ? application : null}
        onSubmitted={() => {
          setIsReapply(false);
          loadUserState();
        }}
      />
    );
  }

  // Pending
  if (view === 'pending') {
    return <PendingView application={application} />;
  }

  // Rejected
  if (view === 'rejected') {
    return (
      <RejectedView
        application={application}
        onReapply={() => {
          setIsReapply(true);
          setView('apply');
        }}
      />
    );
  }

  // Approved dashboard
  if (view === 'dashboard' && dashboard) {
    return <DashboardView dashboard={dashboard} />;
  }

  return (
    <div className="loading">
      <div className="spinner" /> Loading...
    </div>
  );
}