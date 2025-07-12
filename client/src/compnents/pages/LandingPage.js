import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FeatureCard from '../ui/FeatureCard';
import FuturisticNavbar from '../ui/FuturisticNavbar';
import StatsSection from '../ui/StatsSection';
import DashboardMockup from '../ui/DashboardMockup';
import TestimonialsSection from '../ui/TestimonialsSection';
import FuturisticFooter from '../ui/FuturisticFooter';
import ScrollProgress from '../ui/ScrollProgress';
import SmoothButton from '../ui/SmoothButton';
import FadeInView from '../ui/FadeInView';
import InteractiveCard from '../ui/InteractiveCard';

const LandingPage = () => {
  return (
    <div className="min-h-screen relative bg-minimal-futuristic">
      {/* Minimal Scroll Progress */}
      <ScrollProgress />
      
      {/* Navigation */}
      <FuturisticNavbar />
      
      {/* Minimal Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative z-20 container mx-auto px-6 pt-32 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {/* Main Title with Minimal Gradient */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 text-gradient-minimal animate-float"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              letterSpacing: '0.05em'
            }}
            whileHover={{ scale: 1.02 }}
            data-text="RANKFORGE"
          >
            RANKFORGE
          </motion.h1>
          
          {/* Animated Tagline */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-4"
          >
            <motion.p 
              className="text-lg md:text-xl font-medium tracking-wide" 
              style={{ 
                color: 'var(--electric-cyan)',
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.1em'
              }}
            >
              FORGING THE FUTURE OF SEARCH RANKINGS
            </motion.p>
          </motion.div>
          
          {/* Electric Current Line */}
          <motion.div 
            className="w-32 h-1 mx-auto animate-electric-current rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 1, delay: 0.8 }}
          />
        </motion.div>
        
        {/* Enhanced Description */}
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Forge your path to search dominance with our AI-powered SEO optimization platform. 
          Built for the modern web, engineered for extraordinary results.
        </motion.p>
        
        {/* Enhanced CTA Buttons */}
        <FadeInView delay={0.6} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/register">
            <SmoothButton className="font-bold text-lg px-8 py-4 rounded-xl btn-minimal">
              START FORGING
            </SmoothButton>
          </Link>
          <SmoothButton className="px-8 py-4 rounded-xl font-bold text-lg btn-minimal">
            Watch Demo
          </SmoothButton>
        </FadeInView>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Dashboard Preview Section */}
      <section className="relative z-20 py-24">
        <div className="container mx-auto px-6">
          <FadeInView className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gradient-minimal mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Experience the Future
            </h2>
            <p 
              className="text-xl max-w-3xl mx-auto"
              style={{ color: 'var(--text-muted)' }}
            >
              Get a glimpse of our intuitive dashboard that transforms complex SEO data into actionable insights
            </p>
          </FadeInView>
          <InteractiveCard tiltStrength={5}>
            <DashboardMockup />
          </InteractiveCard>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 py-24">
        <div className="container mx-auto px-6">
          <FadeInView className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gradient-minimal"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              FORGE YOUR SUCCESS
            </h2>
          </FadeInView>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FadeInView delay={0.1}>
              <InteractiveCard tiltStrength={3}>
                <FeatureCard
                  icon="🔍"
                  title="Advanced SEO Analysis"
                  description="Forge comprehensive insights into your website's SEO performance with cutting-edge on-page and off-page analysis tools."
                  gradient="var(--gradient-primary)"
                  borderColor="rgba(0, 217, 255, 0.4)"
                />
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.2}>
              <InteractiveCard tiltStrength={3}>
                <FeatureCard
                  icon="🎯"
                  title="Keyword Forge"
                  description="Forge powerful keyword strategies and track your rankings with real-time monitoring and competitor intelligence."
                  gradient="var(--gradient-tertiary)"
                  borderColor="rgba(139, 92, 246, 0.4)"
                />
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.3}>
              <InteractiveCard tiltStrength={3}>
                <FeatureCard
                  icon="📊"
                  title="Analytics Forge"
                  description="Forge actionable insights from your SEO data with our intuitive analytics dashboard and performance tracking tools."
                  gradient="var(--gradient-secondary)"
                  borderColor="rgba(16, 185, 129, 0.4)"
                />
              </InteractiveCard>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer */}
      <FuturisticFooter />
    </div>
  );
};

export default LandingPage;
