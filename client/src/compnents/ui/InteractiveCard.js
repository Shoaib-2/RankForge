import React, { useState } from 'react';
import { motion } from 'framer-motion';

const InteractiveCard = ({ children, className = '', tiltStrength = 10, ...props }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = ((e.clientY - centerY) / rect.height) * tiltStrength;
    const rotateY = ((centerX - e.clientX) / rect.width) * tiltStrength;
    
    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={`${className} transform-gpu`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: mousePosition.y,
        rotateY: mousePosition.x,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      <motion.div
        className="relative"
        animate={{
          translateZ: isHovered ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default InteractiveCard;
