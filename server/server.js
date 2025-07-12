const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// CORS configuration to allow frontend (Vercel) to communicate with backend (Render)
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL, // Production frontend URL from environment variable
    'https://seo-tool-eta.vercel.app', // Fallback without trailing slash
    'http://localhost:3000', // Local development
    'http://localhost:3001'  // Alternative local port
  ],
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 200, // Support legacy browsers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS configuration
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies

// Add preflight handling for complex CORS requests
app.options('*', cors(corsOptions));

// Debug middleware to log CORS requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin') || 'No Origin'}`);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const seoRoutes = require('./routes/seo');
app.use('/api/seo', seoRoutes);

const keywordRoutes = require('./routes/keywords');
app.use('/api/keywords', keywordRoutes);

const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

const exportRoutes = require('./routes/export');
app.use('/api/export', exportRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false
  }
});

async function connectToMongoDB() {
  try {
    // Connect using Mongoose
    await mongoose.connect(uri);
    console.log('Connected to MongoDB via Mongoose');

    // Also connect using MongoClient for ping test
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Initialize server and database connection
const PORT = process.env.PORT || 5000;

connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(console.dir);

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await client.close();
    await mongoose.connection.close();
    console.log('MongoDB connections closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
});