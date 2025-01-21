import React from 'react';

const PageSpeedInsights = ({ pageSpeedData }) => {
  const { score, metrics, recommendations } = pageSpeedData;

  const getScoreColor = (value) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Page Speed Insights</h2>
      
      {/* Overall Score */}
      <div className="flex items-center mb-6">
        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="ml-4">
          <p className="text-gray-600">
            Overall Performance Score
          </p>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(metrics).map(([key, data]) => (
          <div key={key} className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">
              {getMetricLabel(key)}
            </h3>
            <div className="mt-2 flex items-baseline">
              <span className={`text-2xl font-semibold ${getScoreColor(data.score * 100)}`}>
                {typeof data.value === 'number' ? data.value.toFixed(2) : data.value}
              </span>
              <span className="ml-1 text-gray-500 text-sm">
                {key.includes('Time') ? 'ms' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="font-medium text-blue-500 mb-3">Recommendations</h3>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                rec.priority === 'high' 
                  ? 'bg-red-50 border-l-4 border-red-400'
                  : 'bg-yellow-50 border-l-4 border-yellow-400'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      rec.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{rec.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSpeedInsights;