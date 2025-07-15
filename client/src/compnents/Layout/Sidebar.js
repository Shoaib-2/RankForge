import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'SEO Analysis', path: '/seo-analysis', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { name: 'Keywords', path: '/keywords', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    )},
  ];

  return (
    <>
      {/* Modern Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-indigo-200/30 text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <span className="sr-only">Open sidebar</span>
        <svg 
          className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Enhanced Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Modern Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-xl border-r border-indigo-100/50 shadow-2xl transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Content */}
        <div className="h-full flex flex-col relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          {/* Brand Section */}
          <div className="relative flex items-center justify-center h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg">
            <div className="flex items-center space-x-3">
              {/* Brand Icon */}
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>R</span>
              </div>
              {/* Brand Name */}
              <span 
                className="text-xl font-bold text-white"
                style={{ 
                  fontFamily: 'Orbitron, monospace',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                }}
              >
                RANKFORGE
              </span>
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-t-lg"></div>
          </div>

          {/* User Profile Section */}
          <div className="relative px-4 py-4 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/50 to-blue-50/30">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* User Avatar with glow */}
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-indigo-200/50">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.[0] || 'U'}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-indigo-600/70 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 relative overflow-y-auto">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-indigo-50/70 hover:text-indigo-700 hover:scale-105'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Active item glow effect */}
                {location.pathname === item.path && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-lg animate-pulse"></div>
                )}
                
                {/* Icon with animation */}
                <div className={`relative transition-transform duration-300 ${
                  location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  {item.icon}
                </div>
                
                {/* Text */}
                <span className="ml-3 relative z-10">{item.name}</span>
                
                {/* Active indicator */}
                {location.pathname === item.path && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="relative p-4 border-t border-indigo-100/50 bg-gradient-to-r from-red-50/30 to-pink-50/20">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50/70 hover:text-red-700 transition-all duration-300 group hover:scale-105 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;