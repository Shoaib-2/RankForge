import React from 'react';
import { 
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SeoAnalysisResults = ({ analysisData }) => {
  const { score, analysis, recommendations } = analysisData;

  const chartData = {
    labels: ['Score'],
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [
          score > 70 ? '#4CAF50' : score > 50 ? '#FFC107' : '#FF5252',
          '#f0f0f0'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Overall SEO Score</h2>
        <div className="flex items-center">
          <div className="w-32 h-32 relative">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{score}</span>
            </div>
          </div>
          <div className="ml-6">
            <p className="text-gray-600">
              {score > 70 
                ? 'Good SEO score! Keep up the good work.'
                : score > 50 
                ? 'Average SEO score. Room for improvement.'
                : 'Poor SEO score. Needs immediate attention.'}
            </p>
          </div>
        </div>
      </div>

      {/* Meta Analysis Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Meta Tags Analysis</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700">Title</h3>
              <p className="mt-1">{analysis.meta.title || 'No title found'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700">Description</h3>
              <p className="mt-1">{analysis.meta.description || 'No description found'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Analysis Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Content Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700">Word Count</h3>
            <p className="text-2xl font-semibold mt-2">{analysis.content.wordCount}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700">Headings</h3>
            <div className="mt-2">
              <p>H1: {analysis.content.headings.h1}</p>
              <p>H2: {analysis.content.headings.h2}</p>
              <p>H3: {analysis.content.headings.h3}</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700">Images</h3>
            <div className="mt-2">
              <p>Total: {analysis.content.images.total}</p>
              <p>With Alt: {analysis.content.images.withAlt}</p>
              <p>Without Alt: {analysis.content.images.withoutAlt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg ${
                rec.priority === 'high' 
                  ? 'bg-red-50 border-l-4 border-red-400'
                  : 'bg-yellow-50 border-l-4 border-yellow-400'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2
                    ${rec.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                    {rec.category.toUpperCase()}
                  </span>
                  <p className="text-gray-800">{rec.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeoAnalysisResults;