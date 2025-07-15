import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import authService from '../../../services/authService';
import { 
  DocumentArrowDownIcon, 
  DocumentChartBarIcon, 
  ClipboardDocumentIcon, 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon 
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
      {/* Export Buttons */}
      <div className="export-buttons">
        <motion.button
          onClick={handleExportPDF}
          disabled={loading}
          className="export-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-lg">📊</span>
          {loading === 'pdf' ? 'Exporting...' : 'Export PDF'}
        </motion.button>
        
        <motion.button
          onClick={handleExportCSV}
          disabled={loading}
          className="export-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-lg">📋</span>
          {loading === 'csv' ? 'Exporting...' : 'Export CSV'}
        </motion.button>
      </div>

      {/* Email Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          📧 Email Report
        </label>
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
            <span className="text-lg">✉️</span>
            {loading === 'email' ? 'Sending...' : 'Send Report'}
          </motion.button>
        </div>
      </motion.div>

      {/* Message Display */}
      {message && (
        <motion.div 
          className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center">
            <span className="text-xl mr-3">
              {messageType === 'success' ? '✅' : '❌'}
            </span>
            <p className="font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
);
};

export default ExportOptions;