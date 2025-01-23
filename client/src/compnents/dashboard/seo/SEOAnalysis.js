import React from 'react';
import axios from 'axios';
import authService from '../../../services/authService';
import PageSpeedInsights from './PageSpeedInsights';
import ExportOptions from '../export/ExportOptions';
import  { useSEO }  from '../../../context/SeoContext';

const SEOAnalysis = () => {
  const {
    url,
    setUrl,
    results,
    setResults,
    loading,
    setLoading,
    error,
    setError,
    clearAnalysis
  } = useSEO();

  const handleAnalysis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      const response = await axios.post(
        'https://seotool-l1b5.onrender.com/api/seo/analyze',
        { url },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const analysisData = response.data.data;
      setResults({
        score: analysisData.score,
        analysis: analysisData.analysis,
        recommendations: analysisData.recommendations.map((rec, index) => ({
          id: index + 1,
          type: rec.category,
          description: rec.message,
          priority: rec.priority
        }))
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.response?.data?.message || 'Error analyzing website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-500">SEO Analysis</h2>
          {results && (
            <button
              onClick={clearAnalysis}
              className="text-sm text-gray-600 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-semibold "
            >
              Clear Analysis
            </button>
          )}
        </div>
        <form onSubmit={handleAnalysis}>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="url" className="block text-sm font-medium text-blue-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                name="url"
                id="url"
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder=""
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : 'Analyze'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <>
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            {/* Score Section */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-blue-500 mb-6">Analysis Results</h3>
              <div className="flex items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={results.score > 70 ? '#4CAF50' : results.score > 50 ? '#FFC107' : '#FF5252'}
                      strokeWidth="3"
                      strokeDasharray={`${results.score}, 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold ">{results.score}</span>
                  </div>
                </div>
                <div className="ml-6">
                  <h4 className="text-lg font-medium text-blue-500">SEO Score</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {results.score > 70 
                      ? 'Good SEO performance' 
                      : results.score > 50 
                      ? 'Average SEO performance' 
                      : 'Needs improvement'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-blue-500 mb-4">Recommendations</h3>
              <div className="grid gap-4">
                {results.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-900">{rec.type}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rec.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page Speed Insights */}
          {results.analysis.technicalAnalysis?.pageSpeed && (
            <PageSpeedInsights pageSpeedData={results.analysis.technicalAnalysis.pageSpeed} />
          )}

          {/* Export Options */}
          <ExportOptions 
            analysisData={{
              score: results.score,
              analysis: results.analysis,
              recommendations: results.recommendations
            }} 
          />
        </>
      )}
    </div>
  );
};

export default SEOAnalysis;