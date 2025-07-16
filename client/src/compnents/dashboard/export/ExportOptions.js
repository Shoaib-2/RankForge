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
  PresentationChartBarIcon,
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
      console.log('Sending data for PDF:', { analysisData });
      setLoading(true);
      const token = authService.getToken();
      const response = await axios.post(
        'http://localhost:5000/api/export/pdf',
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
    setLoading('csv');
    const token = authService.getToken();
    
    const response = await axios({
      method: 'post',
      url: 'http://localhost:5000/api/export/csv',
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

const handleExportExcel = async () => {
  try {
    setLoading('excel');
    const token = authService.getToken();
    
    const response = await axios({
      method: 'post',
      url: 'http://localhost:5000/api/export/excel',
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
    console.error('Excel Export Error:', error);
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
      url: 'http://localhost:5000/api/export/email-report',
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
  }  };

  const handleExportPowerPoint = async () => {
    try {
      setLoading('ppt');
      const token = authService.getToken();
      const response = await axios.post(
        'http://localhost:5000/api/export/powerpoint',
        { analysisData },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'seo-analysis-presentation.pptx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMessageType('success');
      setMessage('PowerPoint presentation downloaded successfully');
    } catch (error) {
      console.error('PowerPoint Export Error:', error);
      setMessageType('error');
      setMessage('Error exporting PowerPoint presentation');
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
    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
      <DocumentArrowDownIcon className="w-6 h-6 mr-2" />
      Export Options
    </h2>
    
    <div className="space-y-6">
      {/* Professional Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PDF Export */}
        <motion.button
          onClick={handleExportPDF}
          disabled={loading}
          className="export-card group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="export-card-content">
            <DocumentTextIcon className="w-8 h-8 text-red-500 group-hover:text-red-600 transition-colors" />
            <h3 className="font-semibold text-gray-800 mt-2">PDF Report</h3>
            <p className="text-sm text-gray-600">Professional formatted report</p>
            <div className="export-badge">
              {loading === 'pdf' ? 'Generating...' : 'Download'}
            </div>
          </div>
        </motion.button>

        {/* Excel Export */}
        <motion.button
          onClick={handleExportExcel}
          disabled={loading}
          className="export-card group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="export-card-content">
            <TableCellsIcon className="w-8 h-8 text-green-500 group-hover:text-green-600 transition-colors" />
            <h3 className="font-semibold text-gray-800 mt-2">Excel Data</h3>
            <p className="text-sm text-gray-600">Structured data analysis</p>
            <div className="export-badge">
              {loading === 'excel' ? 'Generating...' : 'Download'}
            </div>
          </div>
        </motion.button>

        {/* PowerPoint Export */}
        <motion.button
          onClick={handleExportPowerPoint}
          disabled={loading}
          className="export-card group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="export-card-content">
            <PresentationChartBarIcon className="w-8 h-8 text-orange-500 group-hover:text-orange-600 transition-colors" />
            <h3 className="font-semibold text-gray-800 mt-2">Presentation</h3>
            <p className="text-sm text-gray-600">Executive summary slides</p>
            <div className="export-badge">
              {loading === 'ppt' ? 'Generating...' : 'Download'}
            </div>
          </div>
        </motion.button>

        {/* JSON Export */}
        <motion.button
          onClick={handleExportJSON}
          disabled={loading}
          className="export-card group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="export-card-content">
            <CodeBracketIcon className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
            <h3 className="font-semibold text-gray-800 mt-2">API Data</h3>
            <p className="text-sm text-gray-600">Raw JSON for developers</p>
            <div className="export-badge">
              {loading === 'json' ? 'Generating...' : 'Download'}
            </div>
          </div>
        </motion.button>
      </div>

      {/* Advanced Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Report */}
        <motion.div
          className="export-option-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center mb-4">
            <EnvelopeIcon className="w-6 h-6 text-purple-500 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-800">Email Report</h3>
              <p className="text-sm text-gray-600">Send professional report via email</p>
            </div>
          </div>
          <div className="email-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="futuristic-input flex-1"
            />
            <motion.button
              onClick={handleEmailReport}
              disabled={loading === 'email' || !email}
              className="export-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              {loading === 'email' ? 'Sending...' : 'Send'}
            </motion.button>
          </div>
        </motion.div>

        {/* Schedule Reports */}
        <motion.div
          className="export-option-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center mb-4">
            <CalendarIcon className="w-6 h-6 text-indigo-500 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-800">Schedule Reports</h3>
              <p className="text-sm text-gray-600">Automated weekly/monthly reports</p>
            </div>
          </div>
          <motion.button
            onClick={handleScheduleReport}
            className="export-button w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Schedule Reports
          </motion.button>
        </motion.div>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div 
          className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center">
            {messageType === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500 mr-3" />
            )}
            <p className="font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
);
};

export default ExportOptions;