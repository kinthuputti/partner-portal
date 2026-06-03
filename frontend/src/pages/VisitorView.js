import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/Api';
import axios from 'axios';

export default function VisitorView() {
  const { login } = useAuth();
  const [mode, setMode] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const goHome = () => {
    setMode(null);
    setForm({ name: '', email: '', password: '' });
    setError('');
    setShowPassword(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await loginApi(form.email, form.password);
      login({ name: res.data.name, email: res.data.email, role: res.data.role }, res.data.token);
    } catch {
      setError('Invalid email or password.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        name: form.name, email: form.email, password: form.password,
      });
      const res = await loginApi(form.email, form.password);
      login({ name: res.data.name, email: res.data.email, role: res.data.role }, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
      setLoading(false);
    }
  };

  const formGroupStyle = { textAlign: 'left' };
  const passwordFieldStyle = { position: 'relative' };
  const eyeBtnStyle = {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#aaa',
    fontSize: '1rem',
    padding: 0,
    lineHeight: 1,
  };
  const inputPasswordStyle = { paddingRight: 36, width: '100%', boxSizing: 'border-box' };

  if (mode === 'login') {
    return (
      <div className="landing">
        <div className="card" style={{ width: '100%', maxWidth: 400 }}>
          <h2 className="section-title" style={{ marginBottom: '0.3rem', textAlign: 'left' }}>Welcome back</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'left' }}>Log in to your Haett partner account</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group" style={formGroupStyle}>
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>
            <div className="form-group" style={formGroupStyle}>
              <label>Password</label>
              <div style={passwordFieldStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  required
                  style={inputPasswordStyle}
                />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.88rem', color: '#888' }}>
            Don't have an account?{' '}
            <button onClick={() => { setMode('register'); setError(''); setShowPassword(false); }}
              style={{ background: 'none', border: 'none', color: '#1a1a1a', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
              Create one
            </button>
          </p>
          <button onClick={goHome}
            style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.82rem', width: '100%' }}>
            ← Back to home
          </button>
          <div className="divider" />
          <p style={{ fontSize: '0.75rem', color: '#bbb', textAlign: 'center' }}>
            Test: user@haett.com / user123 · admin@haett.com / admin123
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="landing">
        <div className="card" style={{ width: '100%', maxWidth: 400 }}>
          <h2 className="section-title" style={{ marginBottom: '0.3rem', textAlign: 'left' }}>Create an account</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'left' }}>Join Haett and apply to become a partner</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="form-group" style={formGroupStyle}>
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
            </div>
            <div className="form-group" style={formGroupStyle}>
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>
            <div className="form-group" style={formGroupStyle}>
              <label>Password</label>
              <div style={passwordFieldStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  style={inputPasswordStyle}
                />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.88rem', color: '#888' }}>
            Already have an account?{' '}
            <button onClick={() => { setMode('login'); setError(''); setShowPassword(false); }}
              style={{ background: 'none', border: 'none', color: '#1a1a1a', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
              Log in
            </button>
          </p>
          <button onClick={goHome}
            style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.82rem', width: '100%' }}>
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="landing">
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: 2, color: '#f0b429', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Haett Partner Programme
        </div>
        <h1>Earn more by sharing<br /><span>food you love.</span></h1>
        <p>Join as an affiliate, influencer, gym, or corporate partner. Get your unique discount codes and start earning commissions today.</p>
        <div className="perks">
          <div className="perk">
            <div className="perk-icon">💸</div>
            <h3>Commission on every order</h3>
            <p>Earn every time someone uses your code</p>
          </div>
          <div className="perk">
            <div className="perk-icon">📊</div>
            <h3>Real-time dashboard</h3>
            <p>Track usage, earnings and code performance</p>
          </div>
          <div className="perk">
            <div className="perk-icon">🎯</div>
            <h3>Custom discount codes</h3>
            <p>Unique codes branded to your business</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}
            onClick={() => { setMode('register'); setError(''); }}>
            Apply to become a partner →
          </button>
          <button className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 32px' }}
            onClick={() => { setMode('login'); setError(''); }}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}