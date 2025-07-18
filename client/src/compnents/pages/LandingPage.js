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
      <section className="relative z-20 container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {/* Main Title with Minimal Gradient */}
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-gradient-minimal animate-float"
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
              className="text-base sm:text-lg md:text-xl font-medium tracking-wide px-4" 
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
            className="w-24 sm:w-32 h-1 mx-auto animate-electric-current rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            transition={{ duration: 1, delay: 0.8 }}
          />
        </motion.div>
        
        {/* Enhanced Description */}
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          Forge your path to search dominance with our AI-powered SEO optimization platform. 
          Built for the modern web, engineered for extraordinary results.
        </motion.p>
        
        {/* Enhanced CTA Buttons */}
        <FadeInView delay={0.6} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
          <Link to="/register" className="w-full sm:w-auto">
            <SmoothButton className="w-full sm:w-auto font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl btn-minimal">
              START FORGING
            </SmoothButton>
          </Link>
          <SmoothButton className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg btn-minimal">
            Watch Demo
          </SmoothButton>
        </FadeInView>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Dashboard Preview Section */}
      <section className="relative z-20 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <FadeInView className="text-center mb-12 sm:mb-16">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-minimal mb-4 sm:mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Experience the Future
            </h2>
            <p 
              className="text-lg sm:text-xl max-w-3xl mx-auto px-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Get a glimpse of our intuitive dashboard that transforms complex SEO data into actionable insights
            </p>
          </FadeInView>
          <InteractiveCard tiltStrength={5}>
            <div className="overflow-hidden rounded-xl">
              <DashboardMockup />
            </div>
          </InteractiveCard>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <FadeInView className="text-center mb-12 sm:mb-16">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-minimal"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              FORGE YOUR SUCCESS
            </h2>
          </FadeInView>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <FadeInView delay={0.1}>
              <InteractiveCard tiltStrength={3}>
                <FeatureCard
                  icon="🔍"
                  title="Advanced SEO Analysis"
                  description="Forge comprehensive insights into your website's SEO performance with cutting-edge on-page and off-page analysis tools powered by Google PageSpeed API."
                  gradient="var(--gradient-primary)"
                  borderColor="rgba(0, 217, 255, 0.4)"
                />
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.2}>
              <InteractiveCard tiltStrength={3}>
                <FeatureCard
                  icon="🎯"
                  title="Smart Keyword Tracking"
                  description="Forge powerful keyword strategies with real-time Google rankings, intelligent caching, and quota-optimized API usage for sustainable growth."
                  gradient="var(--gradient-tertiary)"
                  borderColor="rgba(139, 92, 246, 0.4)"
                />
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.3} className="sm:col-span-2 lg:col-span-1">
              <InteractiveCard tiltStrength={3}>
                <FeatureCard
                  icon="📊"
                  title="Performance Analytics"
                  description="Forge actionable insights with advanced PageSpeed metrics, Core Web Vitals tracking, and comprehensive SEO performance analytics."
                  gradient="var(--gradient-secondary)"
                  borderColor="rgba(16, 185, 129, 0.4)"
                />
              </InteractiveCard>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="relative z-20 py-16 sm:py-24 bg-gradient-to-b from-transparent to-rgba(0,0,0,0.1)">
        <div className="container mx-auto px-4 sm:px-6">
          <FadeInView className="text-center mb-12 sm:mb-16">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-minimal mb-4 sm:mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              ENTERPRISE-GRADE OPTIMIZATION
            </h2>
            <p 
              className="text-lg sm:text-xl max-w-3xl mx-auto px-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Built with cutting-edge technology for scalable, cost-effective SEO management
            </p>
          </FadeInView>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            <FadeInView delay={0.1}>
              <InteractiveCard tiltStrength={2}>
                <div className="p-4 sm:p-6 h-full rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">⚡</div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-blue-300">Circuit Breaker Protection</h3>
                  <p className="text-sm text-gray-300">Advanced API quota management with automatic failover to prevent cost overruns</p>
                </div>
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.2}>
              <InteractiveCard tiltStrength={2}>
                <div className="p-4 sm:p-6 h-full rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">💾</div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-green-300">Smart Caching System</h3>
                  <p className="text-sm text-gray-300">15-minute intelligent caching eliminates redundant API calls and accelerates response times</p>
                </div>
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.3}>
              <InteractiveCard tiltStrength={2}>
                <div className="p-4 sm:p-6 h-full rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                  <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🚀</div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-purple-300">Batch Processing</h3>
                  <p className="text-sm text-gray-300">Efficient bulk keyword tracking with progressive rate limiting and exponential backoff</p>
                </div>
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.4}>
              <InteractiveCard tiltStrength={2}>
                <div className="p-4 sm:p-6 h-full rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                  <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📈</div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-orange-300">Real-Time Rankings</h3>
                  <p className="text-sm text-gray-300">Live Google search position tracking with domain matching and comprehensive SERP analysis</p>
                </div>
              </InteractiveCard>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Technical Excellence Section */}
      <section className="relative z-20 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <FadeInView className="text-center mb-12 sm:mb-16">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-minimal mb-4 sm:mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              BUILT FOR SCALE
            </h2>
            <p 
              className="text-lg sm:text-xl max-w-3xl mx-auto px-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Portfolio-grade architecture designed for production environments
            </p>
          </FadeInView>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <FadeInView delay={0.1}>
              <InteractiveCard tiltStrength={3}>
                <div className="p-6 sm:p-8 h-full rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 text-center">💰</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-gradient-minimal">Cost Optimized</h3>
                  <ul className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Free tier API compliance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Quota exhaustion prevention</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Zero unexpected charges</span>
                    </li>
                  </ul>
                </div>
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.2}>
              <InteractiveCard tiltStrength={3}>
                <div className="p-6 sm:p-8 h-full rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 text-center">🛡️</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-gradient-minimal">Enterprise Reliable</h3>
                  <ul className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Graceful error handling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Automatic failover systems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>99.9% uptime guarantee</span>
                    </li>
                  </ul>
                </div>
              </InteractiveCard>
            </FadeInView>
            
            <FadeInView delay={0.3} className="sm:col-span-2 lg:col-span-1">
              <InteractiveCard tiltStrength={3}>
                <div className="p-6 sm:p-8 h-full rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 text-center">⚡</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-gradient-minimal">Lightning Fast</h3>
                  <ul className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">✓</span>
                      <span>Sub-second response times</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">✓</span>
                      <span>Database-first architecture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">✓</span>
                      <span>Intelligent request batching</span>
                    </li>
                  </ul>
                </div>
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
