import { motion } from 'framer-motion';
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
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const PageSpeedInsights = ({ pageSpeedData }) => {
  const { score, metrics, recommendations } = pageSpeedData;

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
              {typeof data.value === 'number' ? data.value.toFixed(1) : data.value}
              <span className="text-sm text-gray-500 ml-1">
                {key.includes('Time') ? 'ms' : ''}
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

      {/* Recommendations */}
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
                  rec.priority === 'high' ? 'score-poor' : 'score-good'
                }`}>
                  {rec.priority === 'high' ? <ExclamationTriangleIcon className="w-5 h-5 text-red-500" /> : <BoltIcon className="w-5 h-5 text-yellow-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rec.priority === 'high' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-gray-600">{rec.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PageSpeedInsights;