const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');
const { authMiddleware } = require('../middleware/auth');
const fs = require('fs'); 

router.post('/pdf', authMiddleware, async (req, res) => {
    try {
        console.log('Received data:', req.body); 
        if (!req.body.analysisData) {
            return res.status(400).json({ message: 'Analysis data is required' });
        }

        const doc = await exportService.generatePDF(req.body.analysisData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=seo_analysis.pdf');
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Error generating PDF report' });
    }
});

router.post('/csv', authMiddleware, async (req, res) => {
    try {
        console.log('Received data:', req.body);
        if (!req.body.analysisData) {
            return res.status(400).json({ message: 'Analysis data is required' });
        }

        const filePath = await exportService.generateCSV(req.body.analysisData);
        res.download(filePath, 'seo_analysis.csv', (err) => {
            if (err) {
                console.error('CSV download error:', err);
                return res.status(500).json({ message: 'Error downloading CSV' });
            }
            // Clean up the file after download
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
            });
        });
    } catch (error) {
        console.error('CSV generation error:', error);
        res.status(500).json({ message: 'Error generating CSV report' });
    }
});

// PowerPoint Export
router.post('/powerpoint', authMiddleware, async (req, res) => {
    try {
        console.log('Received data:', req.body);
        if (!req.body.analysisData) {
            return res.status(400).json({ message: 'Analysis data is required' });
        }

        const filePath = await exportService.generatePowerPoint(req.body.analysisData);
        res.download(filePath, 'seo-analysis-presentation.pptx', (err) => {
            if (err) {
                console.error('PowerPoint download error:', err);
                return res.status(500).json({ message: 'Error downloading PowerPoint' });
            }
            // Clean up the file after download
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
            });
        });
    } catch (error) {
        console.error('PowerPoint generation error:', error);
        res.status(500).json({ message: 'Error generating PowerPoint presentation' });
    }
});

// Excel Export
router.post('/excel', authMiddleware, async (req, res) => {
    try {
        console.log('Received data:', req.body);
        if (!req.body.analysisData) {
            return res.status(400).json({ message: 'Analysis data is required' });
        }

        const filePath = await exportService.generateExcel(req.body.analysisData);
        res.download(filePath, 'seo-analysis.xlsx', (err) => {
            if (err) {
                console.error('Excel download error:', err);
                return res.status(500).json({ message: 'Error downloading Excel' });
            }
            // Clean up the file after download
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
            });
        });
    } catch (error) {
        console.error('Excel generation error:', error);
        res.status(500).json({ message: 'Error generating Excel report' });
    }
});

// JSON Export
router.post('/json', authMiddleware, async (req, res) => {
    try {
        console.log('Received data:', req.body);
        if (!req.body.analysisData) {
            return res.status(400).json({ message: 'Analysis data is required' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=seo-analysis.json');
        res.json(req.body.analysisData);
    } catch (error) {
        console.error('JSON export error:', error);
        res.status(500).json({ message: 'Error exporting JSON data' });
    }
});

// Email Export
router.post('/email-report', authMiddleware, async (req, res) => {
    try {
        console.log('Received data:', req.body);
        const { email, analysisData } = req.body;
        if (!email || !analysisData) {
            return res.status(400).json({ message: 'Email and analysis data are required' });
        }
        
        await exportService.sendEmailReport(email, analysisData);
        res.json({ message: 'Report sent successfully' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ message: 'Error sending email report' });
    }
});

module.exports = router;