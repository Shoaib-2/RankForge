import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  icon = 'R', 
  gradientClass = 'var(--gradient-primary)',
  backgroundShapeColor = 'var(--gradient-primary)',
  showBackToHome = true 
}) => {
  return (
    <div className="min-h-screen relative bg-minimal-futuristic flex items-center justify-center px-6 py-12">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </div>

      {/* Floating Background Shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5"
        style={{ background: backgroundShapeColor }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Back to Home Button */}
      {showBackToHome && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-6 left-6 z-20"
        >
          <Link
            to="/"
            className="flex items-center space-x-2 text-sm transition-colors duration-200 hover:text-cyan-300 glass-effect px-4 py-2 rounded-lg"
            style={{ color: 'var(--electric-cyan)' }}
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </motion.div>
      )}

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 rounded-2xl border border-opacity-20"
          style={{ borderColor: 'var(--electric-cyan)' }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ background: gradientClass }}
              >
                <span className="text-2xl font-bold text-white">{icon}</span>
              </div>
            </div>

            <h1 
              className="text-3xl font-bold text-gradient-minimal mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {title}
            </h1>
            <p 
              className="text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              {subtitle}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
