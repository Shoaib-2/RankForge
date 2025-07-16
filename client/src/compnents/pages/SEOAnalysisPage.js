import React from 'react';
import SEOAnalysis from '../dashboard/seo/SEOAnalysis';
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SEOAnalysisPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">SEO Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">Analyze and optimize your website's SEO performance</p>
        
        {/* Rate Limit Information Banner */}
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                🔒 Rate Limit Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  <strong>Free Tier:</strong> You can perform <span className="font-semibold text-blue-900">10 SEO analyses</span> per day to ensure fair usage.
                  This includes real Google PageSpeed insights and comprehensive SEO scoring.
                </p>
                <div className="mt-2 flex items-center space-x-4 text-xs">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    Real Google API data
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                    Core Web Vitals included
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                    Professional reporting
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SEOAnalysis />
    </div>
  );
};

export default SEOAnalysisPage;