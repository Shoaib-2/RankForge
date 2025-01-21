import React from 'react';
import KeywordTracker from '../dashboard/keywords/KeywordTracker';

const KeywordsPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Keyword Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor and manage your keyword rankings</p>
      </div>
      <KeywordTracker />
    </div>
  );
};

export default KeywordsPage;