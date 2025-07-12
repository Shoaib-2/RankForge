import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const AnimatedCounter = ({ end, duration = 2, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="text-gradient font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const stats = [
    { 
      number: 10000, 
      suffix: '+', 
      label: 'Websites Analyzed',
      icon: '🔍',
      description: 'Comprehensive SEO audits completed'
    },
    { 
      number: 50000, 
      suffix: '+', 
      label: 'Keywords Tracked',
      icon: '🎯',
      description: 'Real-time ranking monitoring'
    },
    { 
      number: 99.9, 
      suffix: '%', 
      label: 'Uptime Guarantee',
      icon: '⚡',
      description: 'Reliable performance you can count on'
    },
    { 
      number: 24, 
      suffix: '/7', 
      label: 'Support Available',
      icon: '🛠️',
      description: 'Round-the-clock assistance'
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'var(--gradient-primary)' }}
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
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10"
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
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 text-gradient-minimal"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            TRUSTED BY THOUSANDS
          </h2>
          <p 
            className="text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Join the ranks of successful businesses that have forged their path to SEO dominance with RankForge
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="glass-effect p-8 rounded-2xl text-center relative overflow-hidden hover-3d-lift">
                {/* Background Glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20"
                  style={{ background: 'var(--gradient-primary)' }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Floating Icon */}
                <motion.div
                  className="text-4xl mb-4"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                >
                  {stat.icon}
                </motion.div>
                
                {/* Animated Number */}
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <AnimatedCounter 
                    end={stat.number} 
                    suffix={stat.suffix}
                    duration={2 + index * 0.5}
                  />
                </div>
                
                {/* Label */}
                <h3 
                  className="text-lg font-bold mb-2 text-cyber"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {stat.label}
                </h3>
                
                {/* Description */}
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {stat.description}
                </p>
                
                {/* Bottom Accent Line */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 rounded-t-full opacity-0 group-hover:opacity-100"
                  style={{ 
                    background: 'var(--gradient-primary)',
                    width: '60%',
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
