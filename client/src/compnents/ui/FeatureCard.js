import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  gradient, 
  borderColor, 
  delay = 0,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group perspective-1000"
      {...props}
    >
      <motion.div
        className="glass-effect p-8 rounded-2xl relative overflow-hidden"
        style={{ 
          border: `1px solid ${borderColor}`,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ 
          rotateY: 5,
          rotateX: 5,
          z: 50,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, transparent, ${borderColor}15)`,
            opacity: 0,
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Floating light orb */}
        <motion.div
          className="absolute top-4 right-4 w-3 h-3 rounded-full"
          style={{
            background: borderColor,
            boxShadow: `0 0 20px ${borderColor}`,
          }}
          animate={{
            scale: isHovered ? [1, 1.5, 1] : 1,
            opacity: isHovered ? [0.5, 1, 0.5] : 0.3,
          }}
          transition={{ 
            duration: 2,
            repeat: isHovered ? Infinity : 0,
          }}
        />
        
        {/* Main content */}
        <div className="relative z-10">
          {/* Icon container with 3D effect */}
          <motion.div
            className="w-16 h-16 mb-6 rounded-full flex items-center justify-center"
            style={{ background: gradient }}
            whileHover={{ 
              rotateY: 180,
              scale: 1.1,
            }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-2xl">{icon}</span>
          </motion.div>
          
          {/* Title with stagger animation */}
          <motion.h3 
            className="text-2xl font-bold mb-4"
            style={{ color: borderColor }}
            animate={{
              y: isHovered ? -2 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {title.split(' ').map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-2"
                animate={{
                  y: isHovered ? [-2, -4, -2] : 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  repeat: isHovered ? Infinity : 0,
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h3>
          
          {/* Description */}
          <motion.p 
            style={{ color: 'var(--text-secondary)' }}
            animate={{
              opacity: isHovered ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
          >
            {description}
          </motion.p>
        </div>
        
        {/* Hover effect lines */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
            opacity: 0,
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scaleX: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l border-t opacity-30" 
             style={{ borderColor }} />
        <div className="absolute top-2 right-2 w-4 h-4 border-r border-t opacity-30" 
             style={{ borderColor }} />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b opacity-30" 
             style={{ borderColor }} />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b opacity-30" 
             style={{ borderColor }} />
      </motion.div>
      
      {/* 3D shadow */}
      <motion.div
        className="absolute inset-0 rounded-2xl -z-10"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          filter: 'blur(10px)',
          transform: 'translateY(10px) translateZ(-50px)',
        }}
        animate={{
          transform: isHovered 
            ? 'translateY(15px) translateZ(-60px)' 
            : 'translateY(10px) translateZ(-50px)',
          opacity: isHovered ? 0.4 : 0.2,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default FeatureCard;
