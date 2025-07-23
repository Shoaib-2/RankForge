import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import authService from '../../../services/authService';
import { 
  DocumentArrowDownIcon, 
  DocumentChartBarIcon, 
  ClipboardDocumentIcon, 
  EnvelopeIcon,
  XCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon,
  ShareIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const ExportOptions = ({ analysisData }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const handleExportPDF = async () => {
    try {
      // console.log('Sending data for PDF:', { analysisData });
      setLoading(true);
      const token = authService.getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/export/pdf`,
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
    // console.error('PDF Export Error:', error);
    setMessageType('error');
    setMessage('Error exporting PDF');
  } finally {
    setLoading(false);
  }
};

const handleExportCSV = async () => {
  try {
    setLoading('csv');
    const token = authService.getToken();
    
    const response = await axios({
      method: 'post',
      url: `${process.env.REACT_APP_API_URL}/export/csv`,
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
    // console.error('CSV Export Error:', error);
    setMessageType('error');
    setMessage('Error exporting CSV');
  } finally {
    setLoading(false);
  }
};

const handleExportExcel = async () => {
  try {
    setLoading('excel');
    const token = authService.getToken();
    
    const response = await axios({
      method: 'post',
      url: `${process.env.REACT_APP_API_URL}/export/excel`,
      data: { analysisData },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'seo-analysis.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    setMessageType('success');
    setMessage('Excel file downloaded successfully');
  } catch (error) {
    // console.error('Excel Export Error:', error);
    setMessageType('error');
    setMessage('Error exporting Excel file');
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
      url: `${process.env.REACT_APP_API_URL}/export/email-report`,
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
    // console.error('Email Error:', error);
    setMessageType('error');
    setMessage('Error sending email report');
  } finally {
    setLoading(false);
  }
};

  const handleExportJSON = async () => {
    try {
      setLoading('json');
      const dataStr = JSON.stringify(analysisData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const downloadUrl = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'seo-analysis-data.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMessageType('success');
      setMessage('JSON data downloaded successfully');
    } catch (error) {
      console.error('JSON Export Error:', error);
      setMessageType('error');
      setMessage('Error exporting JSON data');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = async () => {
    try {
      setMessageType('success');
      setMessage('Report scheduling feature coming soon!');
    } catch (error) {
      setMessageType('error');
      setMessage('Error scheduling report');
    }
  };

return (
  <motion.div 
    className="export-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 lg:mb-8 flex items-center">
      <DocumentArrowDownIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
      Export Options
    </h2>
    
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Professional Export Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* PDF Export */}
        <motion.button
          onClick={handleExportPDF}
          disabled={loading}
          className="export-card group p-4 sm:p-6 lg:p-8"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="export-card-content text-center">
            <DocumentTextIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-red-500 group-hover:text-red-600 transition-colors mx-auto" />
            <h3 className="font-semibold text-gray-800 mt-2 sm:mt-3 lg:mt-4 text-sm sm:text-base lg:text-lg">PDF Report</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2">Professional formatted report</p>
            <div className="export-badge mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm">
              {loading === 'pdf' ? 'Generating...' : 'Download'}
            </div>
          </div>
        </motion.button>

        {/* Excel Export */}
        <motion.button
          onClick={handleExportExcel}
          disabled={loading}
          className="export-card group p-4 sm:p-6 lg:p-8"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="export-card-content text-center">
            <TableCellsIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-500 group-hover:text-green-600 transition-colors mx-auto" />
            <h3 className="font-semibold text-gray-800 mt-2 sm:mt-3 lg:mt-4 text-sm sm:text-base lg:text-lg">Excel Data</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2">Structured data analysis</p>
            <div className="export-badge mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm">
              {loading === 'excel' ? 'Generating...' : 'Download'}
            </div>
          </div>
        </motion.button>

        {/* JSON Export */}
        <motion.button
          onClick={handleExportJSON}
          disabled={loading}
          className="export-card group p-4 sm:p-6 lg:p-8"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="export-card-content text-center">
            <CodeBracketIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500 group-hover:text-blue-600 transition-colors mx-auto" />
            <h3 className="font-semibold text-gray-800 mt-2 sm:mt-3 lg:mt-4 text-sm sm:text-base lg:text-lg">API Data</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2">Raw JSON for developers</p>
            <div className="export-badge mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm">
              {loading === 'json' ? 'Generating...' : 'Download'}
            </div>
          </div>
        </motion.button>
      </div>

      {/* Advanced Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Email Report */}
        <motion.div
          className="export-option-card p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center mb-3 sm:mb-4 lg:mb-6">
            <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-500 mr-2 sm:mr-3" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">Email Report</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">Send professional report via email</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="futuristic-input flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
            />
            <motion.button
              onClick={handleEmailReport}
              disabled={loading === 'email' || !email}
              className="export-button px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EnvelopeIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
              {loading === 'email' ? 'Sending...' : 'Send'}
            </motion.button>
          </div>
        </motion.div>

        {/* Schedule Reports */}
        <motion.div
          className="export-option-card p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center mb-3 sm:mb-4 lg:mb-6">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-indigo-500 mr-2 sm:mr-3" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">Schedule Reports</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">Automated weekly/monthly reports</p>
            </div>
          </div>
          <motion.button
            onClick={handleScheduleReport}
            className="export-button w-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
            Schedule Reports
          </motion.button>
        </motion.div>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div 
          className={`alert p-4 sm:p-6 rounded-lg sm:rounded-xl ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center">
            {messageType === 'success' ? (
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
            ) : (
              <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
            )}
            <p className="font-medium text-sm sm:text-base lg:text-lg">{message}</p>
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
);
};

export default ExportOptions;