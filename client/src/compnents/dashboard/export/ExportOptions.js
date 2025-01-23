import React, { useState } from 'react';
import axios from 'axios';
import authService from '../../../services/authService';

const ExportOptions = ({ analysisData }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const handleExportPDF = async () => {
    try {
      console.log('Sending data for PDF:', { analysisData });
      setLoading(true);
      const token = authService.getToken();
      const response = await axios.post(
        'https://seotool-l1b5.onrender.com/api/export/pdf',
        { analysisData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

    // Create and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'seo-analysis.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    setMessageType('success');
    setMessage('PDF downloaded successfully');
  } catch (error) {
    console.error('PDF Export Error:', error);
    setMessageType('error');
    setMessage('Error exporting PDF');
  } finally {
    setLoading(false);
  }
};

const handleExportCSV = async () => {
  try {
    setLoading(true);
    const token = authService.getToken();
    
    const response = await axios({
      method: 'post',
      url: 'https://seotool-l1b5.onrender.com/api/export/csv',
      data: { analysisData },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'seo-analysis.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    setMessageType('success');
    setMessage('CSV downloaded successfully');
  } catch (error) {
    console.error('CSV Export Error:', error);
    setMessageType('error');
    setMessage('Error exporting CSV');
  } finally {
    setLoading(false);
  }
};

const handleEmailReport = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    const token = authService.getToken();
    
    await axios({
      method: 'post',
      url: 'https://seotool-l1b5.onrender.com/api/export/email-report',
      data: { 
        email,
        analysisData 
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    setEmail('');
    setMessageType('success');
    setMessage('Report sent successfully to ' + email);
  } catch (error) {
    console.error('Email Error:', error);
    setMessageType('error');
    setMessage('Error sending email report');
  } finally {
    setLoading(false);
  }
};

return (
  <div className="bg-white shadow-sm rounded-lg p-6">
    <h2 className="text-xl font-semibold text-blue-500 mb-6">Export Options</h2>
    
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleExportPDF}
          disabled={loading === 'pdf'}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow-sm transition duration-500"
        >
          {loading === 'pdf' ? 'Exporting...' : 'Export PDF'}
        </button>
        
        <button
          onClick={handleExportCSV}
          disabled={loading === 'csv'}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow-sm transition duration-500"
        >
          {loading === 'csv' ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Email Form */}
        <div>
          <label className="block text-sm font-medium text-blue-500 mb-2">
            Email Report
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
          onClick={handleEmailReport}
          disabled={loading === 'email'}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow-sm transition duration-500"
            >
          {loading === 'email' ? 'Sending...' : 'Send Report'}
            </button>
          </div>
        </div>

        {/* Message Display */}
      {message && (
        <div className={`mt-4 p-4 rounded-md ${
          messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  </div>
);
};

export default ExportOptions;