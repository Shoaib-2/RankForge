import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-1 z-50"
      style={{
        background: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <motion.div
        className="h-full"
        style={{
          background: 'linear-gradient(90deg, var(--electric-cyan), var(--neon-purple))',
          width: `${scrollProgress}%`,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      />
    </motion.div>
  );
};

export default ScrollProgress;
