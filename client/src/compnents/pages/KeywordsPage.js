import React from 'react';
import KeywordTracker from '../dashboard/keywords/KeywordTracker';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const KeywordsPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Keyword Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor and manage your keyword rankings</p>
        
        {/* Rate Limit Notice */}
        <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-3 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-4 w-4 text-green-400 mt-0.5" />
            </div>
            <div className="ml-2">
              <p className="text-sm text-green-700">
                <strong>Note:</strong> Keyword analysis is included in the 3 SEO analyses per session limit. 
                This ensures optimal performance and fair resource allocation across all users.
              </p>
            </div>
          </div>
        </div>
      </div>
      <KeywordTracker />
    </div>
  );
};

export default KeywordsPage;