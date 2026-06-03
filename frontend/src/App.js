import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PartnerPage from './pages/PartnerPage';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <PartnerPage />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '0.88rem', borderRadius: 8 },
        }}
      />
    </AuthProvider>
  );
}