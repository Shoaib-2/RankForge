import React from 'react';
import { motion } from 'framer-motion';

const LoadingButton = ({ 
  children, 
  isLoading = false, 
  loadingText = 'Loading...', 
  className = '', 
  disabled = false,
  type = 'button',
  ...props 
}) => {
  return (
    <motion.button
      type={type}
      disabled={isLoading || disabled}
      className={`w-full py-3 px-4 rounded-xl font-bold text-lg transition-all duration-300 btn-minimal ${className}`}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      style={{
        opacity: disabled && !isLoading ? 0.6 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer'
      }}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default LoadingButton;
