import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="container mx-auto px-6 py-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold"
        >
          SEO Optimization Tool
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl mt-4"
        >
          Elevate your website's ranking with our powerful and intuitive SEO analysis tool.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link to="/register">
            <button className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Get Started
            </button>
          </Link>
        </motion.div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="bg-gray-800 p-6 rounded-lg"
          >
            <h3 className="text-2xl font-bold mb-4">SEO Analysis</h3>
            <p>Get a comprehensive analysis of your website's SEO performance, including on-page and off-page factors.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="bg-gray-800 p-6 rounded-lg"
          >
            <h3 className="text-2xl font-bold mb-4">Keyword Tracking</h3>
            <p>Track your keyword rankings and get insights into your competitors' keyword strategies.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="bg-gray-800 p-6 rounded-lg"
          >
            <h3 className="text-2xl font-bold mb-4">Analytics Dashboard</h3>
            <p>Visualize your SEO data with our interactive and easy-to-use analytics dashboard.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
