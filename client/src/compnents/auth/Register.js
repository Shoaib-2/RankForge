import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    website: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-minimal-futuristic flex items-center justify-center px-6 py-12">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </div>

      {/* Floating Background Shapes */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-5"
        style={{ background: 'var(--gradient-secondary)' }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

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
                style={{ background: 'var(--gradient-secondary)' }}
              >
                <span className="text-2xl font-bold text-white">R</span>
              </div>
            </div>

            <h1 
              className="text-3xl font-bold text-gradient-minimal mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Join RankForge
            </h1>
            <p 
              className="text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              Create your account and start forging success
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl border"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
            >
              <div className="text-sm font-medium">{error}</div>
            </motion.div>
          )}

          {/* Register Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Name Field */}
            <div>
              <label 
                htmlFor="name"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'rgba(0, 217, 255, 0.3)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--electric-cyan)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(0, 217, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your full name"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-cyan-400">👤</span>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'rgba(0, 217, 255, 0.3)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--electric-cyan)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(0, 217, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-cyan-400">📧</span>
                </div>
              </div>
            </div>

            {/* Website Field */}
            <div>
              <label 
                htmlFor="website"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Website URL (Optional)
              </label>
              <div className="relative">
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'rgba(0, 217, 255, 0.3)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--electric-cyan)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(0, 217, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="https://yourwebsite.com"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-cyan-400">🌐</span>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'rgba(0, 217, 255, 0.3)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--electric-cyan)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(0, 217, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Create a strong password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-cyan-400">🔒</span>
                </div>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Minimum 6 characters required
              </p>
            </div>

            {/* Register Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-lg transition-all duration-300 btn-minimal"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </motion.form>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium transition-colors duration-200 hover:text-cyan-300"
                style={{ color: 'var(--electric-cyan)' }}
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
export default Register;