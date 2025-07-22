import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate(); 
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'reset'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar
    );
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate sending reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('reset');
      setError('');
    } catch (err) {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const { email, newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      );
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while resetting password');
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
        className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full opacity-5"
        style={{ background: 'var(--gradient-tertiary)' }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 270, 360],
        }}
        transition={{
          duration: 30,
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
                style={{ background: 'var(--gradient-tertiary)' }}
              >
                <span className="text-2xl font-bold text-white">🔑</span>
              </div>
            </div>

            <h1 
              className="text-3xl font-bold text-gradient-minimal mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {step === 'email' ? 'Reset Password' : 'Create New Password'}
            </h1>
            <p 
              className="text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              {step === 'email' 
                ? 'Enter your email to receive reset instructions'
                : 'Enter your new password below'
              }
            </p>
          </motion.div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl border text-center"
              style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#10b981'
              }}
            >
              <div className="text-sm font-medium mb-2">✅ Password Reset Successful!</div>
              <div className="text-xs">Redirecting to login page...</div>
            </motion.div>
          )}

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

          {/* Email Step */}
          {step === 'email' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onSubmit={handleEmailSubmit}
              className="space-y-6"
            >
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
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Send Reset Button */}
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
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Reset Password Step */}
          {step === 'reset' && !success && (
            <motion.form
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              onSubmit={handleResetSubmit}
              className="space-y-6"
            >
              {/* New Password Field */}
              <div>
                <label 
                  htmlFor="newPassword"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={formData.newPassword}
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
                    placeholder="Enter new password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label 
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
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
                    placeholder="Confirm new password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  8+ characters with uppercase, lowercase, number & special character
                </p>
              </div>

              {/* Reset Button */}
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Back to Login Link */}
          {!success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-center"
            >
              <p style={{ color: 'var(--text-secondary)' }}>
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-medium transition-colors duration-200 hover:text-cyan-300"
                  style={{ color: 'var(--electric-cyan)' }}
                >
                  Back to sign in
                </Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;