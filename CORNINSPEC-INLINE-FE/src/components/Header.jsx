import React, { useState } from 'react';
import { FaRegUserCircle, FaChevronDown } from 'react-icons/fa';
import btglogoB from "../assets/btglogoB.png";

function Header({ onLoginClick, onRegisterClick, onLogoutClick, username }) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (action) => {
    action();          // เรียกฟังก์ชันที่ถูกส่งเข้ามา (onLoginClick, onRegisterClick, onLogoutClick)
    setMenuOpen(false); // ยุบเมนูหลังจากคลิก
  };

  return (
    <header className="flex justify-between items-center p-4 bg-primary text-white shadow-lg relative z-20">
      <div className="flex-1 flex justify-start items-center">
        <h1 className="text-2xl font-bold ml-4">CORNINSPEC INLINE</h1>
      </div>

      <div className="relative">
        <button onClick={toggleMenu} className="flex items-center space-x-2 focus:outline-none">
          <FaRegUserCircle size={30} />
          <span>{username}</span>
          <FaChevronDown size={14} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg z-30">
            <ul>
              <li>
                <button onClick={() => handleMenuItemClick(onLoginClick)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick(onRegisterClick)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Register
                </button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick(onLogoutClick)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Log Out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
