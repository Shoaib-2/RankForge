import React from 'react';
import { motion } from 'framer-motion';

const DashboardMockup = () => {
  return (
    <motion.div 
      className="glass-no-blur rounded-2xl p-8 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gradient-minimal">RankForge Dashboard</h3>
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Live Data</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'SEO Score', value: '94', color: '#10b981' },
          { label: 'Keywords Tracked', value: '1,247', color: '#00d9ff' },
          { label: 'Organic Traffic', value: '+23.5%', color: '#8b5cf6' },
          { label: 'Page Speed', value: '98ms', color: '#ec4899' }
        ].map((metric, index) => (
          <motion.div
            key={index}
            className="glass-no-blur rounded-xl p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div 
              className="text-3xl font-bold mb-2"
              style={{ color: metric.color }}
            >
              {metric.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {metric.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="glass-no-blur rounded-xl p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
          Ranking Trends
        </h4>
        <div className="flex items-end justify-between space-x-2 h-32 px-4">
          {[65, 72, 68, 78, 85, 82, 90].map((value, index) => (
            <motion.div
              key={index}
              className="w-12 rounded-t-lg relative"
              style={{
                background: `linear-gradient(to top, var(--electric-cyan), var(--neon-purple))`,
                height: `${value}%`,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Keywords Table Preview */}
      <div className="glass-no-blur rounded-xl p-6">
        <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
          Top Keywords
        </h4>
        <div className="space-y-3">
          {[
            { keyword: 'seo optimization', position: 1, change: '+2' },
            { keyword: 'digital marketing', position: 3, change: '+1' },
            { keyword: 'keyword research', position: 2, change: '0' },
            { keyword: 'content strategy', position: 5, change: '+3' }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between py-3 px-4 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{item.keyword}</span>
              <div className="flex items-center space-x-4">
                <span className="font-bold text-cyan-400">#{item.position}</span>
                <span 
                  className={`text-sm px-2 py-1 rounded ${
                    item.change.includes('+') ? 'text-green-400 bg-green-400/10' : 
                    item.change === '0' ? 'text-gray-400 bg-gray-400/10' : 
                    'text-red-400 bg-red-400/10'
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardMockup;
