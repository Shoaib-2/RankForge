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

    generateProfessionalEmailTemplate(analysisData) {
        const priorityColors = {
            critical: '#dc2626',
            high: '#ea580c', 
            medium: '#ca8a04',
            low: '#2563eb'
        };

        const scoreColor = (analysisData?.score || 0) > 70 ? '#10b981' : 
                          (analysisData?.score || 0) > 50 ? '#f59e0b' : '#ef4444';

        // Generate sample recommendations if none exist
        const recommendations = analysisData?.recommendations || [
            {
                title: "Optimize Page Title",
                category: "On-Page SEO", 
                priority: "high",
                description: "Your page title needs optimization for better search visibility",
                actionItems: ["Review title length (30-60 characters)", "Include primary keyword", "Make it compelling for users"],
                timeEstimate: "30 minutes",
                expectedImpact: "High"
            },
            {
                title: "Add Meta Description", 
                category: "Technical SEO",
                priority: "critical",
                description: "Missing meta description reduces click-through rates from search results", 
                actionItems: ["Write compelling 150-160 character description", "Include call-to-action", "Target main keywords"],
                timeEstimate: "15 minutes",
                expectedImpact: "High"
            }
        ];

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your SEO Analysis Report - Rank Forge</title>
    <style>
        /* Reset and Base Styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f8fafc;
            margin: 0;
            padding: 0;
        }
        
        /* Container */
        .email-container { 
            max-width: 650px; 
            margin: 20px auto; 
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 3rem 2rem 2rem;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        .logo {
            font-size: 2.2rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            letter-spacing: -1px;
        }
        
        .logo::before {
            content: '⚡';
            margin-right: 8px;
            font-size: 2rem;
        }
        
        .header-subtitle {
            opacity: 0.95;
            font-size: 1.1rem;
            font-weight: 500;
            position: relative;
            z-index: 1;
            letter-spacing: 0.5px;
        }
        
        /* Content */
        .content {
            padding: 2.5rem;
        }
        
        .personal-greeting {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-left: 4px solid #0ea5e9;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-radius: 8px;
            font-style: italic;
            color: #0c4a6e;
        }
        
        /* Score Section */
        .score-section {
            text-align: center;
            background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
            padding: 3rem 2rem;
            margin: 2rem 0;
            border-radius: 16px;
            border: 1px solid #e4e4e7;
            position: relative;
        }
        
        .score-wrapper {
            display: inline-block;
            position: relative;
        }
        
        .score-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: ${scoreColor};
            color: white;
            display: table;
            table-layout: fixed;
            font-size: 2.2rem;
            font-weight: 800;
            margin: 0 auto 1.5rem;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
            position: relative;
        }
        
        .score-circle::before {
            content: '';
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            border-radius: 50%;
            background: linear-gradient(45deg, ${scoreColor}40, transparent);
            z-index: -1;
        }
        
        .score-label {
            font-size: 1.4rem;
            font-weight: 700;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .score-description {
            color: #6b7280;
            font-size: 1.05rem;
            max-width: 400px;
            margin: 0 auto;
        }
        
        /* Summary Stats */
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin: 3rem 0;
        }
        
        .stat-card {
            text-align: center;
            padding: 2rem 1rem;
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 900;
            color: #1f2937;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Recommendations */
        .section {
            margin: 3rem 0;
        }
        
        .section-title {
            font-size: 1.6rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid #667eea;
            position: relative;
        }
        
        .section-title::before {
            content: '🎯';
            margin-right: 10px;
            font-size: 1.4rem;
        }
        
        .recommendation {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-left: 5px solid var(--priority-color);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .recommendation:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
        }
        
        .rec-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
            gap: 1rem;
        }
        
        .rec-info {
            flex: 1;
            min-width: 200px;
        }
        
        .rec-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
            line-height: 1.3;
        }
        
        .rec-category {
            font-size: 0.8rem;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 1px;
            background: #f3f4f6;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            display: inline-block;
        }
        
        .priority-badge {
            padding: 0.6rem 1.2rem;
            border-radius: 25px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            color: white;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            flex-shrink: 0;
            white-space: nowrap;
            min-width: 100px;
            height: 36px;
            margin-left: auto;
            float: right;
        }
        
        .rec-description {
            color: #4b5563;
            margin-bottom: 1.5rem;
            line-height: 1.7;
            font-size: 1.05rem;
        }
        
        .action-items {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .action-items h4 {
            color: #1f2937;
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
        }
        
        .action-items h4::before {
            content: '✨';
            margin-right: 8px;
            font-size: 1.1rem;
        }
        
        .action-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        
        .action-item {
            color: #4b5563;
            font-size: 0.95rem;
            margin-bottom: 0.75rem;
            position: relative;
            padding-left: 2rem;
            line-height: 1.5;
        }
        
        .action-item:before {
            content: "→";
            color: #10b981;
            font-weight: bold;
            position: absolute;
            left: 0.5rem;
            top: 0;
            font-size: 1.1rem;
        }
        
        .rec-footer {
            display: flex;
            justify-content: space-between;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.85rem;
            color: #6b7280;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .rec-footer span {
            background: #f9fafb;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            border: 1px solid #e5e7eb;
        }
        
        /* CTA Section */
        .cta-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 3rem 2rem;
            margin: 3rem 0;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
        }
        
        .cta-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
            opacity: 0.4;
        }
        
        .cta-title {
            font-size: 1.8rem;
            font-weight: 800;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }
        
        .cta-text {
            opacity: 0.95;
            margin-bottom: 2rem;
            font-size: 1.1rem;
            position: relative;
            z-index: 1;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .cta-button {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 1rem 2.5rem;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 700;
            font-size: 1.05rem;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        /* Footer */
        .footer {
            background: #f9fafb;
            padding: 2.5rem;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-brand {
            font-weight: 700;
            color: #374151;
            margin-bottom: 1rem;
        }
        
        .footer-links {
            margin: 1.5rem 0;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 1.5rem;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .footer-links a:hover {
            color: #4f46e5;
        }
        
        .footer-copyright {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.8rem;
            color: #9ca3af;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
            .email-container { 
                margin: 10px; 
                border-radius: 12px;
            }
            .content { padding: 1.5rem; }
            .header { padding: 2rem 1.5rem 1.5rem; }
            .score-circle { 
                width: 85px; 
                height: 85px; 
                font-size: 1.8rem; 
            }
            .summary-stats { 
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            .rec-header {
                flex-direction: column;
                align-items: stretch;
                gap: 1rem;
            }
            .priority-badge {
                align-self: center;
                margin: 0.5rem auto 0;
                float: none;
                width: auto;
                max-width: 120px;
                min-width: 80px;
                padding: 0.4rem 0.8rem;
                font-size: 0.7rem;
                height: auto;
                min-height: 28px;
                line-height: 1.2;
                text-align: center;
                word-wrap: break-word;
                overflow-wrap: break-word;
                hyphens: auto;
            }
            .recommendation {
                padding: 1.5rem;
                margin-bottom: 1rem;
            }
            .rec-info {
                min-width: auto;
                margin-bottom: 0.5rem;
            }
            .rec-title {
                font-size: 1.1rem;
                line-height: 1.4;
            }
            .rec-description {
                font-size: 1rem;
                margin-bottom: 1rem;
            }
            .action-items {
                padding: 1rem;
                margin-bottom: 0.75rem;
            }
            .rec-footer {
                flex-direction: column;
                text-align: center;
                gap: 0.5rem;
            }
            .rec-footer span {
                font-size: 0.8rem;
                padding: 0.4rem 0.8rem;
            }
            .footer-links a {
                display: block;
                margin: 0.5rem 0;
            }
        }
        
        /* Extra small mobile devices */
        @media (max-width: 400px) {
            .content { padding: 1rem; }
            .recommendation { padding: 1rem; }
            .priority-badge {
                max-width: 100px;
                font-size: 0.65rem;
                padding: 0.3rem 0.6rem;
                min-height: 24px;
            }
            .rec-title {
                font-size: 1rem;
            }
            .stat-number {
                font-size: 2rem;
            }
            .logo {
                font-size: 1.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">⚡ Rank Forge</div>
            <div class="header-subtitle">Professional SEO Intelligence Report</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Personal Greeting -->
            <div class="personal-greeting">
                Hey there! 👋 We just finished diving deep into your website's SEO performance, and honestly? We found some pretty exciting opportunities. Your site has solid potential, and with a few strategic tweaks, you could see some serious improvements in your search rankings. Let's break it down...
            </div>
            
            <!-- Score Section -->
            <div class="score-section">
                <div class="score-wrapper">
                    <div class="score-circle">
                        <span style="display: table-cell; vertical-align: middle; text-align: center; width: 100px; height: 100px;">${analysisData?.score || 75}</span>
                    </div>
                </div>
                <div class="score-label">Your SEO Health Score</div>
                <div class="score-description">
                    ${(analysisData?.score || 75) > 80 ? 'Outstanding! Your website is performing exceptionally well in search engines. Keep up the great work!' :
                      (analysisData?.score || 75) > 60 ? 'Pretty solid foundation! With a few strategic improvements, you could really dominate your niche.' :
                      (analysisData?.score || 75) > 40 ? 'Good starting point! There are some quick wins that could significantly boost your visibility.' :
                      'Lots of untapped potential here! The good news is that every improvement will have a big impact.'}
                </div>
            </div>
            
            <!-- Summary Stats -->
            <div class="summary-stats">
                <div class="stat-card">
                    <div class="stat-number">${recommendations.length}</div>
                    <div class="stat-label">Action Items</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length}</div>
                    <div class="stat-label">Quick Wins</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round((analysisData?.score || 75) * 1.2)}</div>
                    <div class="stat-label">Potential Score</div>
                </div>
            </div>
            
            <!-- Recommendations Section -->
            <div class="section">
                <h2 class="section-title">Top Priority Improvements</h2>
                ${recommendations.slice(0, 5).map(rec => `
                    <div class="recommendation" style="--priority-color: ${priorityColors[rec.priority || 'medium']}">
                        <div class="rec-header">
                            <div class="rec-info">
                                <div class="rec-title">${rec.title || 'SEO Improvement Opportunity'}</div>
                                <div class="rec-category">${rec.category || 'General SEO'}</div>
                            </div>
                            <div class="priority-badge" style="background-color: ${priorityColors[rec.priority || 'medium']}; display: table; table-layout: fixed;">
                                <span style="display: table-cell; vertical-align: middle; text-align: center;">${(rec.priority || 'medium').charAt(0).toUpperCase() + (rec.priority || 'medium').slice(1)} Priority</span>
                            </div>
                        </div>
                        <div class="rec-description">${rec.description || 'This improvement will help boost your search engine visibility and user experience.'}</div>
                        ${rec.actionItems && rec.actionItems.length > 0 ? `
                            <div class="action-items">
                                <h4>What to do next:</h4>
                                <ul class="action-list">
                                    ${rec.actionItems.slice(0, 3).map(item => `<li class="action-item">${item}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        <div class="rec-footer">
                            <span><strong>Time needed:</strong> ${rec.timeEstimate || '30-60 minutes'}</span>
                            <span><strong>Expected impact:</strong> ${rec.expectedImpact || 'Medium to High'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- CTA Section -->
            <div class="cta-section">
                <div class="cta-title">Ready to Dominate Search Results?</div>
                <div class="cta-text">
                    Look, we know SEO can feel overwhelming, but you're already ahead of 90% of websites just by getting this analysis. These improvements? They're your roadmap to more traffic, more leads, and more growth. Let's make it happen! 🚀
                </div>
                <a href="#" class="cta-button">Start Your SEO Journey</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-brand">Rank Forge - SEO Made Simple</div>
            <div>This comprehensive report was crafted by our SEO experts just for you.</div>
            <div class="footer-links">
                <a href="#">Dashboard</a>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
            </div>
            <div class="footer-copyright">
                © 2025 Rank Forge. Made with ❤️ for businesses that want to grow online.
            </div>
        </div>
    </div>
</body>
</html>
        `;
    }

    // Legacy template for backward compatibility
    generateEmailTemplate(analysisData) {
        return this.generateProfessionalEmailTemplate(analysisData);
    }

    async sendEmailReport(email, analysisData) {
        try {
            if (!email || !analysisData) {
                throw new Error('Email and analysis data are required');
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: '⚡ Your SEO Analysis is Ready - Rank Forge',
                html: this.generateProfessionalEmailTemplate(analysisData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }

    async sendScheduledReport(email, analysisData, frequency) {
        // Implementation for scheduled reports
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `📊 Your ${frequency} SEO Report - Rank Forge`,
                html: this.generateProfessionalEmailTemplate(analysisData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('Scheduled email error:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();