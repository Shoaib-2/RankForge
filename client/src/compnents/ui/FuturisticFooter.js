import React from 'react';
import { motion } from 'framer-motion';

const FuturisticFooter = () => {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Analytics', href: '#analytics' },
      { name: 'Keywords', href: '#keywords' },
      { name: 'Competitor Analysis', href: '#competitors' },
      { name: 'Page Speed', href: '#speed' },
    ],
    Resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' },
      { name: 'Tutorials', href: '#tutorials' },
      { name: 'Blog', href: '#blog' },
      { name: 'Case Studies', href: '#cases' },
    ],
    Company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
      { name: 'Partners', href: '#partners' },
      { name: 'Press', href: '#press' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: '𝕏', href: '#twitter' },
    { name: 'LinkedIn', icon: '💼', href: '#linkedin' },
    { name: 'GitHub', icon: '🐙', href: '#github' },
    { name: 'Discord', icon: '💬', href: '#discord' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, var(--electric-cyan) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, var(--neon-purple) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, var(--electric-green) 0%, transparent 50%)
            `,
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-30"
            style={{
              background: i % 3 === 0 ? 'var(--electric-cyan)' : 
                         i % 3 === 1 ? 'var(--neon-purple)' : 'var(--electric-green)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Content */}
          <div className="text-center">
            {/* Brand Section */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="flex items-center justify-center mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl mr-4 flex items-center justify-center"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <span className="text-2xl font-bold" style={{ color: 'var(--primary-bg)' }}>
                    RF
                  </span>
                </motion.div>
                <div>
                  <h3 
                    className="text-2xl font-bold text-gradient"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    RankForge
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    AI-Powered SEO
                  </p>
                </div>
              </motion.div>
              
              <motion.p
                className="text-lg mb-8 leading-relaxed max-w-2xl mx-auto"
                style={{ color: 'var(--text-muted)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Transform your digital presence with cutting-edge SEO technology. 
                Join thousands of businesses achieving unprecedented growth.
              </motion.p>
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div
            className="my-12 h-px relative"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--electric-cyan), transparent)',
              }}
              animate={{
                backgroundPosition: ['-200% 0%', '200% 0%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Bottom Section */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            viewport={{ once: true }}
          >
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p style={{ color: 'var(--text-muted)' }}>
                © {new Date().getFullYear()} RankForge. All rights reserved.
              </p>
              <motion.p
                className="text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                viewport={{ once: true }}
              >
                Powered by cutting-edge AI technology
              </motion.p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="w-12 h-12 rounded-xl glass-effect flex items-center justify-center text-xl relative overflow-hidden group"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20"
                    style={{ background: 'var(--gradient-primary)' }}
                    whileHover={{ opacity: 0.2 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10" style={{ color: 'var(--text-primary)' }}>
                    {social.icon}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--electric-cyan), transparent)',
        }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </footer>
  );
};

export default FuturisticFooter;
