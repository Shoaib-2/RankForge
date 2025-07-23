
# RankForge

RankForge is a comprehensive, full-stack SEO analysis and optimization platform. It empowers users to analyze website SEO, track keyword rankings, and generate actionable AI-powered insights and reports. Built with React, Node.js, Tailwind CSS, and MongoDB, RankForge is designed for modern web performance and security.



## Table of Contents

1. Features
2. Installation
3. Usage
4. Project Structure
5. Environment Variables
6. Security
7. License

---

## Features

- **SEO Analysis:** Analyze your website's SEO performance, including meta tags, content structure, mobile responsiveness, and technical aspects.
- **AI-Powered Insights:** Get executive summaries, priority actions, and industry trends using Google Gemini AI.
- **Keyword Tracking:** Track and monitor keyword rankings and competitors over time.
- **Export Options:** Generate and export SEO analysis reports in PDF, CSV, and Excel formats, or email them directly.
- **User Authentication:** Secure JWT-based authentication and authorization.
- **Admin Dashboard:** Monitor AI usage, rate limits, and system status.
- **Responsive UI:** Modern, beautiful design with Tailwind CSS and Framer Motion.



## Installation

Clone the repository:
```bash
git clone https://github.com/your-username/rankforge.git
cd rankforge
```

Set up environment variables:
- Create a `.env` file in both the `client` and `server` directories with the necessary environment variables. Refer to `.env.example` files for required variables.

Install dependencies:
```bash
cd server
npm install
cd ../client
npm install
```

Start the development servers:
```bash
# Start backend
cd ../server
npm start

# Start frontend
cd ../client
npm start
```

## Usage

1. Register a new account or log in with an existing account.
2. Navigate to the dashboard for an overview of your SEO performance.
3. Use the SEO Analysis page to analyze your website's SEO performance and get AI-powered insights.
4. Track and monitor keyword rankings on the Keywords page.
5. Export SEO analysis reports in PDF, CSV, or Excel format from the Export Options section.



## Project Structure

```
client/
  ├── public/
  ├── src/
  │   ├── compnents/
  │   │   ├── auth/
  │   │   ├── dashboard/
  │   │   ├── export/
  │   │   ├── Layout/
  │   │   └── pages/
  │   ├── context/
  │   ├── services/
  │   ├── App.js
  │   ├── App.css
  │   ├── index.js
  │   └── index.css
  ├── .env
  ├── package.json
  └── tailwind.config.js
server/
  ├── controllers/
  ├── middleware/
  ├── models/
  ├── routes/
  ├── services/
  ├── .env
  ├── server.js
  ├── package.json
  └── .gitignore
```

## Environment Variables


### Server (`server/.env`)
- `PORT=5000`
- `MONGODB_URI=your_mongodb_uri`
- `JWT_SECRET=your_jwt_secret`
- `FRONTEND_URL=http://localhost:3000`
- `BACKEND_URL=http://localhost:5000`
- `GOOGLE_API_KEY=your_google_api_key`
- `GOOGLE_CSE_ID=your_google_cse_id`
- `GOOGLE_PAGESPEED_API_KEY=your_pagespeed_api_key`
- `GEMINI_API_KEY=your_gemini_api_key`


### Client (`client/.env`)
- `REACT_APP_API_URL=http://localhost:5000/api`

## Security

- All sensitive credentials are stored in environment variables and never exposed to the client.
- CORS is strictly configured to allow only the deployed frontend.
- All console logs and debug statements are commented out in production.

## License

MIT
