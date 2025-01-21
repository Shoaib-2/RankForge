import React from 'react';
import SEOAnalysis from '../dashboard/seo/SEOAnalysis';

const SEOAnalysisPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">SEO Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">Analyze and optimize your website's SEO performance</p>
      </div>
      <SEOAnalysis />
    </div>
  );
};

export default SEOAnalysisPage;