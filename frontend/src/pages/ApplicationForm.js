import React, { useState } from 'react';
import { applyPartner, reapplyPartner } from '../services/Api';
import toast from 'react-hot-toast';

const PARTNER_TYPES = [
  { value: 'AFFILIATE', label: 'Affiliate' },
  { value: 'INFLUENCER', label: 'Influencer' },
  { value: 'GYM', label: 'Gym' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'PARTNER_ASSOCIATE', label: 'Partner Associate' },
];

export default function ApplicationForm({ onSubmitted, isReapply = false, prefill = null }) {
  const [form, setForm] = useState({
    partnerType: prefill?.partnerType || '',
    businessName: prefill?.businessName || '',
    phone: prefill?.phone || '',
    socialLink: prefill?.socialLink || '',
    audienceSize: prefill?.audienceSize || '',
    description: prefill?.description || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const isValid = form.partnerType && form.businessName.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        audienceSize: form.audienceSize ? parseInt(form.audienceSize) : null,
      };
      if (isReapply) {
        await reapplyPartner(payload);
        toast.success('Reapplication submitted!');
      } else {
        await applyPartner(payload);
        toast.success('Application submitted!');
      }
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 620, margin: '0 auto' }}>
        <h2 className="section-title">
          {isReapply ? 'Reapply as a Partner' : 'Apply to become a Partner'}
        </h2>
        <p className="section-sub">
          {isReapply
            ? 'Update your details and resubmit your application.'
            : 'Fill in your details below. We review all applications within a few business days.'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Partner Type <span style={{ color: '#dc2626' }}>*</span></label>
            <select value={form.partnerType} onChange={set('partnerType')} required>
              <option value="">Select a type...</option>
              {PARTNER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Business / Brand Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              value={form.businessName}
              onChange={set('businessName')}
              placeholder="e.g. FitLife Studios"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="form-group">
              <label>Estimated Audience Size</label>
              <input
                type="number"
                value={form.audienceSize}
                onChange={set('audienceSize')}
                placeholder="e.g. 5000"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website or Social Media Link</label>
            <input
              type="url"
              value={form.socialLink}
              onChange={set('socialLink')}
              placeholder="https://instagram.com/yourbrand"
            />
          </div>

          <div className="form-group">
            <label>
              Tell us about yourself
              <span style={{ color: '#aaa', fontWeight: 400, marginLeft: 6 }}>
                ({form.description.length}/500)
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Briefly describe what you do and why you'd be a great partner..."
              maxLength={500}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            type="submit"
            disabled={!isValid || loading}
          >
            {loading ? 'Submitting...' : isReapply ? 'Resubmit Application' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}