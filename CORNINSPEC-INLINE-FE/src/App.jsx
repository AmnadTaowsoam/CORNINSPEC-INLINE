import React, { useState } from 'react';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Footer from './components/Footer';
import Home from './pages/Home';
import './styles/index.css';

function App() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('Amnad Taowsoam'); // จำลอง username 

  const handleLogin = () => {
    setLoggedIn(true);
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);  // ตั้งค่า isLoggedIn เป็น false เมื่อ logout
  };

  return (
    <div className="App flex flex-col min-h-screen relative">
      <Header 
        onLoginClick={() => setLoginOpen(true)} 
        onRegisterClick={() => setRegisterOpen(true)} 
        onLogoutClick={handleLogout}  // ส่งฟังก์ชัน logout
        username={username}           // ส่ง username ไปที่ Header
        className="relative z-20"
      />

      <main className="flex-grow p-4 relative z-10 flex items-center justify-center">
        {isLoggedIn ? (
          <Home />
        ) : (
          <p className='text-center text-4xl font-bold text-blue-500 animate-pulse'>
            🚀 Get Ready! Please log in to Start Your Streaming Adventure! 🎬
          </p>
        )}
      </main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} className="relative z-50" />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} className="relative z-60" />
    </div>
  );
}

export default App;
