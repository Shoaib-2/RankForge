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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
          <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Page Speed Insights
        </h2>
        <div className="text-center py-6 sm:py-8">
          <p className="text-gray-500 text-sm sm:text-base">No PageSpeed data available</p>
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
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 lg:mb-8 flex items-center">
        <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
        Page Speed Insights
      </h2>

      {/* Mobile/Desktop Tabs */}
      {hasMobile && hasDesktop && (
        <div className="flex space-x-1 mb-4 sm:mb-6 lg:mb-8 bg-gray-100 p-1 rounded-lg w-full sm:w-auto mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-md transition-colors text-sm sm:text-base flex-1 sm:flex-initial ${
              activeTab === 'mobile'
                ? 'bg-white text-blue-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <DevicePhoneMobileIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
            Mobile
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-md transition-colors text-sm sm:text-base flex-1 sm:flex-initial ${
              activeTab === 'desktop'
                ? 'bg-white text-blue-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ComputerDesktopIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
            Desktop
          </button>
        </div>
      )}
      
      {/* Overall Score */}
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-center sm:justify-start mb-6 sm:mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      >
        <div className={`score-badge w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="ml-0 sm:ml-6 text-center sm:text-left mt-4 sm:mt-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Performance Score</h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {score >= 90 ? (
              <><SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" />Excellent Performance!</>
            ) : score >= 50 ? (
              <><HandThumbUpIcon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" />Good Performance</>
            ) : (
              <><WrenchScrewdriverIcon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" />Needs Optimization</>
            )}
          </p>
        </div>
      </motion.div>

      {/* Core Web Vitals */}
      {Object.keys(metrics).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
          {Object.entries(metrics).map(([key, data], index) => (
            <motion.div 
              key={key} 
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 rounded-full" style={{ 
                  background: data.score >= 0.9 ? 'linear-gradient(135deg, #10b981, #059669)' :
                             data.score >= 0.5 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                             'linear-gradient(135deg, #ef4444, #dc2626)'
                }}>
                  <div className="text-white">
                    {getMetricIcon(key)}
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                    {typeof data.value === 'number' ? 
                      (data.value > 1 ? data.value.toFixed(1) : data.value.toFixed(3)) : 
                      data.value}
                    <span className="text-xs sm:text-sm lg:text-base text-gray-500 ml-1">
                      {key.includes('Time') || key.includes('Paint') || key.includes('Index') ? 
                        (data.value > 1 ? 's' : 'ms') : 
                        (key.includes('Shift') ? '' : 'ms')}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-700">{getMetricLabel(key)}</h4>
                </div>
                <div className="w-full">
                  <div className={`w-full h-2 sm:h-3 rounded-full overflow-hidden ${
                    data.score >= 0.9 ? 'bg-green-100' : data.score >= 0.5 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <motion.div 
                      className={`h-full rounded-full ${
                        data.score >= 0.9 ? 'bg-green-500' : data.score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.score * 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                    <span>Poor</span>
                    <span>Good</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8 lg:py-10 mb-6 sm:mb-8 lg:mb-10">
          <ClockIcon className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
          <p className="text-gray-500 text-sm sm:text-base lg:text-lg">Core Web Vitals data not available</p>
        </div>
      )}

      {/* Speed Optimization Tips */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 lg:mb-6 flex items-center">
            <LightBulbIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
            Speed Optimization Tips ({recommendations.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-2 sm:p-3 rounded-lg ${
                        rec.impact === 'high' ? 'bg-red-50' : rec.impact === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
                      }`}>
                        {rec.impact === 'high' ? 
                          <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500" /> : 
                          <BoltIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500" />
                        }
                      </div>
                      <span className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">{rec.title}</span>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${
                      rec.impact === 'high' 
                        ? 'bg-red-100 text-red-700' 
                        : rec.impact === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {rec.impact?.toUpperCase() || 'LOW'} IMPACT
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">{rec.description}</p>
                  {rec.potentialSavings && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm lg:text-base text-blue-700 font-medium">
                        💡 Potential savings: {rec.potentialSavings}
                      </p>
                    </div>
                  )}
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