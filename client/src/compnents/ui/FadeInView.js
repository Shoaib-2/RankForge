import React from 'react';
import { motion } from 'framer-motion';

const FadeInView = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.6,
  y = 20,
  once = true 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      viewport={{ once }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInView;
