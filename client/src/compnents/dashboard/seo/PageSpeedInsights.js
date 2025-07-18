import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  RocketLaunchIcon, 
  PaintBrushIcon, 
  BoltIcon, 
  PhotoIcon, 
  HandRaisedIcon, 
  ClockIcon, 
  Squares2X2Icon, 
  ChartBarIcon, 
  SparklesIcon, 
  HandThumbUpIcon, 
  WrenchScrewdriverIcon, 
  LightBulbIcon, 
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const PageSpeedInsights = ({ pageSpeedData }) => {
  const { mobile, desktop } = pageSpeedData;
  const [activeTab, setActiveTab] = useState('mobile');
  
  // Check if we have data for both mobile and desktop
  const hasMobile = mobile && mobile.score !== undefined;
  const hasDesktop = desktop && desktop.score !== undefined;
  
  if (!hasMobile && !hasDesktop) {
    return (
      <div className="seo-analysis-section">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <RocketLaunchIcon className="w-6 h-6 mr-2" />
          Page Speed Insights
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No PageSpeed data available</p>
        </div>
      </div>
    );
  }

  // Use the active tab data, fallback to available data
  const currentData = activeTab === 'mobile' ? 
    (hasMobile ? mobile : desktop) : 
    (hasDesktop ? desktop : mobile);
  
  const score = currentData.score || 0;
  const metrics = currentData.coreWebVitals || {};
  const recommendations = currentData.opportunities || [];

  const getScoreColor = (value) => {
    if (value >= 90) return 'score-excellent';
    if (value >= 50) return 'score-good';
    return 'score-poor';
  };

  const getMetricLabel = (metric) => {
    const labels = {
      firstContentfulPaint: 'First Contentful Paint',
      speedIndex: 'Speed Index', 
      largestContentfulPaint: 'Largest Contentful Paint',
      timeToInteractive: 'Time to Interactive',
      totalBlockingTime: 'Total Blocking Time',
      cumulativeLayoutShift: 'Cumulative Layout Shift'
    };
    return labels[metric] || metric;
  };

  const getMetricIcon = (metric) => {
    const icons = {
      firstContentfulPaint: <PaintBrushIcon className="w-5 h-5" />,
      speedIndex: <BoltIcon className="w-5 h-5" />,
      largestContentfulPaint: <PhotoIcon className="w-5 h-5" />,
      timeToInteractive: <HandRaisedIcon className="w-5 h-5" />,
      totalBlockingTime: <ClockIcon className="w-5 h-5" />,
      cumulativeLayoutShift: <Squares2X2Icon className="w-5 h-5" />
    };
    return icons[metric] || <ChartBarIcon className="w-5 h-5" />;
  };

  return (
    <motion.div 
      className="seo-analysis-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <RocketLaunchIcon className="w-6 h-6 mr-2" />
        Page Speed Insights
      </h2>

      {/* Mobile/Desktop Tabs */}
      {hasMobile && hasDesktop && (
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === 'mobile'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
            Mobile
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === 'desktop'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ComputerDesktopIcon className="w-4 h-4 mr-2" />
            Desktop
          </button>
        </div>
      )}
      
      {/* Overall Score */}
      <motion.div 
        className="flex items-center justify-center md:justify-start mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      >
        <div className={`score-badge w-24 h-24 text-3xl ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="ml-6">
          <h3 className="text-2xl font-bold text-gray-800">Performance Score</h3>
          <p className="text-gray-600 mt-1">
            {score >= 90 ? (
              <><SparklesIcon className="w-5 h-5 inline mr-1" />Excellent Performance!</>
            ) : score >= 50 ? (
              <><HandThumbUpIcon className="w-5 h-5 inline mr-1" />Good Performance</>
            ) : (
              <><WrenchScrewdriverIcon className="w-5 h-5 inline mr-1" />Needs Optimization</>
            )}
          </p>
        </div>
      </motion.div>

      {/* Core Web Vitals */}
      {Object.keys(metrics).length > 0 ? (
        <div className="page-speed-container mb-8">
          {Object.entries(metrics).map(([key, data], index) => (
            <motion.div 
              key={key} 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="stat-card-icon" style={{ 
                background: data.score >= 0.9 ? 'linear-gradient(135deg, #10b981, #059669)' :
                           data.score >= 0.5 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                           'linear-gradient(135deg, #ef4444, #dc2626)'
              }}>
                {getMetricIcon(key)}
              </div>
              <div className="stat-card-value">
                {typeof data.value === 'number' ? 
                  (data.value > 1 ? data.value.toFixed(1) : data.value.toFixed(3)) : 
                  data.value}
                <span className="text-sm text-gray-500 ml-1">
                  {key.includes('Time') || key.includes('Paint') || key.includes('Index') ? 
                    (data.value > 1 ? 's' : 'ms') : 
                    (key.includes('Shift') ? '' : 'ms')}
                </span>
              </div>
              <div className="stat-card-label">{getMetricLabel(key)}</div>
              <div className="mt-2">
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  data.score >= 0.9 ? 'bg-green-100' : data.score >= 0.5 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <motion.div 
                    className={`h-full ${
                      data.score >= 0.9 ? 'bg-green-500' : data.score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.score * 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Core Web Vitals data not available</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <LightBulbIcon className="w-5 h-5 mr-2" />
            Speed Optimization Tips ({recommendations.length})
          </h3>
          <div className="analysis-results">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                className="analysis-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start">
                  <div className={`score-badge ${
                    rec.impact === 'high' ? 'score-poor' : 'score-good'
                  }`}>
                    {rec.impact === 'high' ? <ExclamationTriangleIcon className="w-5 h-5 text-red-500" /> : <BoltIcon className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800">{rec.title}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        rec.impact === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : rec.impact === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {rec.impact?.toUpperCase() || 'LOW'} IMPACT
                      </span>
                    </div>
                    <p className="text-gray-600">{rec.description}</p>
                    {rec.potentialSavings && (
                      <p className="text-sm text-blue-600 mt-1">
                        Potential savings: {rec.potentialSavings}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PageSpeedInsights;