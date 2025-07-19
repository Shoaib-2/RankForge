import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const FuturisticNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-effect' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span className="text-xl font-bold text-white">R</span>
              </div>
              <span 
                className="text-xl font-bold text-gradient-minimal"
                style={{ 
                  fontFamily: 'Orbitron, monospace'
                }}
              >
                RANKFORGE
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium transition-colors duration-200 hover:text-cyan-400"
                style={{ color: 'var(--text-secondary)' }}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.name}
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'var(--gradient-primary)' }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass-effect neon-border relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <motion.div
                className="w-5 h-5 relative"
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? (
                  // Sun icon for dark mode (switch to light)
                  <svg
                    className="w-5 h-5"
                    style={{ color: 'var(--electric-cyan)' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  // Moon icon for light mode (switch to dark)
                  <svg
                    className="w-5 h-5"
                    style={{ color: 'var(--electric-cyan)' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </motion.div>
              <motion.div
                className="absolute inset-0"
                style={{ background: 'var(--gradient-primary)', opacity: 0 }}
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <Link to="/login">
              <motion.button
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{ color: 'var(--text-secondary)' }}
                whileHover={{ 
                  scale: 1.05,
                  color: 'var(--electric-cyan)',
                }}
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                className="glass-effect px-6 py-2 text-sm font-medium rounded-lg neon-border relative overflow-hidden group"
                style={{ color: 'var(--text-primary)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'var(--gradient-primary)', opacity: 0 }}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <motion.span
                className="w-full h-0.5 mb-1 rounded-full"
                style={{ background: 'var(--electric-cyan)' }}
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 6 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-full h-0.5 mb-1 rounded-full"
                style={{ background: 'var(--electric-cyan)' }}
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-full h-0.5 rounded-full"
                style={{ background: 'var(--electric-cyan)' }}
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -6 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden mt-4 glass-effect rounded-xl p-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-4">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10, color: 'var(--electric-cyan)' }}
                  >
                    {item.name}
                  </motion.a>
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  {/* Mobile Theme Toggle */}
                  <motion.button
                    onClick={() => {
                      toggleTheme();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium rounded-lg glass-effect neon-border flex items-center justify-center space-x-2"
                    style={{ color: 'var(--text-secondary)' }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className="w-4 h-4"
                      initial={false}
                      animate={{ rotate: isDark ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isDark ? (
                        <svg
                          className="w-4 h-4"
                          style={{ color: 'var(--electric-cyan)' }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          style={{ color: 'var(--electric-cyan)' }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      )}
                    </motion.div>
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </motion.button>

                  <Link to="/login">
                    <motion.button
                      className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileHover={{ scale: 1.02 }}
                    >
                      Sign In
                    </motion.button>
                  </Link>
                  <Link to="/register">
                    <motion.button
                      className="w-full glass-effect px-4 py-2 text-sm font-medium rounded-lg neon-border"
                      style={{ color: 'var(--text-primary)' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileHover={{ scale: 1.02 }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default FuturisticNavbar;
