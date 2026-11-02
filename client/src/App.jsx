import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import CreateSecret from './pages/CreateSecret';
import ShareFile from './pages/ShareFile';
import ViewSecret from './pages/ViewSecret';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-secret" element={<CreateSecret />} />
            <Route path="/share-file" element={<ShareFile />} />
            <Route path="/secret/:token" element={<ViewSecret />} />
            <Route path="/file/:token" element={<ViewSecret />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Dark Mode Toast Container */}
        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            backgroundColor: '#0f1422',
            color: '#f8fafc',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    </BrowserRouter>
  );
}
