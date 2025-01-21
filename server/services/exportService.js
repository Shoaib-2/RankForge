const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

class ExportService {
    constructor() {
        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
    }

    async generatePDF(analysisData) {
        try {
            if (!analysisData || !analysisData.score) {
                throw new Error('Invalid analysis data');
            }

            const doc = new PDFDocument();
            
            // Add content to PDF with null checks
            doc.fontSize(25).text('SEO Analysis Report', { align: 'center' });
            doc.moveDown();
            
            // Overall Score
            doc.fontSize(16).text(`Overall Score: ${analysisData.score || 'N/A'}`);
            doc.moveDown();

            // Meta Analysis
            doc.fontSize(14).text('Meta Analysis');
            doc.fontSize(12).text(`Title: ${analysisData?.analysis?.meta?.title || 'N/A'}`);
            doc.text(`Description: ${analysisData?.analysis?.meta?.description || 'N/A'}`);
            doc.moveDown();

            // Content Analysis
            if (analysisData?.analysis?.content) {
                doc.fontSize(14).text('Content Analysis');
                doc.fontSize(12)
                    .text(`Word Count: ${analysisData.analysis.content.wordCount || 0}`)
                    .text(`Headings: H1 (${analysisData.analysis.content.headings?.h1 || 0}), H2 (${analysisData.analysis.content.headings?.h2 || 0}), H3 (${analysisData.analysis.content.headings?.h3 || 0})`);
            }

            return doc;
        } catch (error) {
            console.error('PDF generation error:', error);
            throw error;
        }
    }


    async generateCSV(analysisData) {
        const csvWriter = createCsvWriter({
            path: path.join(__dirname, '../../temp/analysis_report.csv'),
            header: [
                { id: 'category', title: 'Category' },
                { id: 'metric', title: 'Metric' },
                { id: 'value', title: 'Value' }
            ]
        });

        const records = [
            { category: 'Overall', metric: 'Score', value: analysisData.score },
            { category: 'Meta', metric: 'Title', value: analysisData.analysis.meta.title },
            { category: 'Meta', metric: 'Description', value: analysisData.analysis.meta.description },
            { category: 'Content', metric: 'Word Count', value: analysisData.analysis.content.wordCount },
            { category: 'Content', metric: 'H1 Count', value: analysisData.analysis.content.headings.h1 },
            { category: 'Content', metric: 'H2 Count', value: analysisData.analysis.content.headings.h2 },
            { category: 'Content', metric: 'H3 Count', value: analysisData.analysis.content.headings.h3 }
        ];

        await csvWriter.writeRecords(records);
        return path.join(__dirname, '../../temp/analysis_report.csv');
    }

    async sendEmailReport(email, analysisData) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        const emailTemplate = this.generateEmailTemplate(analysisData);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your SEO Analysis Report',
            html: emailTemplate
        };

        return await transporter.sendMail(mailOptions);
    }

    generateEmailTemplate(analysisData) {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { padding: 20px; }
                        .score { font-size: 24px; color: #4F46E5; }
                        .section { margin: 20px 0; }
                        .metric { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>SEO Analysis Report</h1>
                        <div class="score">Overall Score: ${analysisData.score}</div>
                        
                        <div class="section">
                            <h2>Meta Analysis</h2>
                            <div class="metric">
                                <strong>Title:</strong> ${analysisData.analysis.meta.title || 'N/A'}
                            </div>
                            <div class="metric">
                                <strong>Description:</strong> ${analysisData.analysis.meta.description || 'N/A'}
                            </div>
                        </div>

                        <div class="section">
                            <h2>Content Analysis</h2>
                            <div class="metric">
                                <strong>Word Count:</strong> ${analysisData.analysis.content.wordCount}
                            </div>
                            <div class="metric">
                                <strong>Headings:</strong>
                                H1: ${analysisData.analysis.content.headings.h1},
                                H2: ${analysisData.analysis.content.headings.h2},
                                H3: ${analysisData.analysis.content.headings.h3}
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }
}

module.exports = new ExportService();