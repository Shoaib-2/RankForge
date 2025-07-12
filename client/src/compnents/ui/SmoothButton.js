import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SmoothButton = ({ children, className = '', onClick, ...props }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-inherit"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isPressed ? { scale: 2, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  );
};

export default SmoothButton;
