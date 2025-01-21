const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            throw new Error('Email configuration missing');
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            },
            secure: true
        });
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
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>SEO Analysis Report</h1>
                        <div class="score">Score: ${analysisData?.score || 'N/A'}</div>
                        
                        <div class="section">
                            <h2>Meta Analysis</h2>
                            <p>Title: ${analysisData?.analysis?.meta?.title || 'N/A'}</p>
                            <p>Description: ${analysisData?.analysis?.meta?.description || 'N/A'}</p>
                        </div>

                        <div class="section">
                            <h2>Content Analysis</h2>
                            <p>Word Count: ${analysisData?.analysis?.content?.wordCount || 0}</p>
                            <p>Headings: 
                                H1 (${analysisData?.analysis?.content?.headings?.h1 || 0}), 
                                H2 (${analysisData?.analysis?.content?.headings?.h2 || 0}), 
                                H3 (${analysisData?.analysis?.content?.headings?.h3 || 0})
                            </p>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    async sendEmailReport(email, analysisData) {
        try {
            if (!email || !analysisData) {
                throw new Error('Email and analysis data are required');
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your SEO Analysis Report',
                html: this.generateEmailTemplate(analysisData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();