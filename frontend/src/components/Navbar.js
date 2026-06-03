import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">haett<span>.</span></div>
      <div className="navbar-right">
        {user && (
          <>
            <span className="navbar-user">
              {user.name} · {user.role === 'ADMIN' ? '👑 Admin' : 'Partner'}
            </span>
            <button className="btn-logout" onClick={logout}>Log out</button>
          </>
        )}
      </div>
    </nav>
  );
}