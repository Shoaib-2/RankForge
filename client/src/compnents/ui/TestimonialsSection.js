import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Digital Marketing Director",
      company: "TechFlow Inc.",
      avatar: "SC",
      content: "RankForge revolutionized our SEO strategy. We saw a 300% increase in organic traffic within 3 months. The AI-powered insights are incredible!",
      rating: 5,
      results: "+300% Traffic"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "CEO & Founder",
      company: "Growth Labs",
      avatar: "MR",
      content: "The competitor analysis feature gave us the edge we needed. RankForge's predictive algorithms helped us outrank competitors in our niche.",
      rating: 5,
      results: "#1 Rankings"
    },
    {
      id: 3,
      name: "Emily Watson",
      role: "SEO Specialist",
      company: "Digital Dynamics",
      avatar: "EW",
      content: "Finally, an SEO tool that understands context and intent. The automated optimization suggestions saved us hundreds of hours.",
      rating: 5,
      results: "500hrs Saved"
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full opacity-10"
        style={{ background: 'var(--gradient-primary)' }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-4 sm:right-10 w-16 sm:w-24 h-16 sm:h-24 rounded-full opacity-15"
        style={{ background: 'var(--gradient-secondary)' }}
        animate={{
          y: [0, 15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-4 sm:mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl max-w-3xl mx-auto px-4"
            style={{ color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of satisfied customers who've transformed their SEO with RankForge
          </motion.p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="relative max-w-4xl mx-auto mb-12 px-4 sm:px-8 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              className="glass-effect p-6 sm:p-8 md:p-12 rounded-3xl relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              transition={{ duration: 0.6 }}
            >
              {/* Quote Icon */}
              <motion.div
                className="absolute top-4 right-4 text-4xl sm:text-6xl opacity-20"
                style={{ color: 'var(--electric-cyan)' }}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                "
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center">
                    <motion.div
                      className="w-12 sm:w-16 h-12 sm:h-16 rounded-full flex items-center justify-center mr-4 ring-2 font-bold text-lg sm:text-xl"
                      style={{ 
                        background: 'var(--gradient-primary)',
                        ringColor: 'var(--electric-cyan)',
                        color: 'var(--primary-bg)'
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {testimonials[activeTestimonial].avatar}
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {testimonials[activeTestimonial].name}
                      </h4>
                      <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
                        {testimonials[activeTestimonial].role} at {testimonials[activeTestimonial].company}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    className="px-3 sm:px-4 py-2 rounded-full text-sm font-bold self-start sm:self-center"
                    style={{
                      background: 'var(--gradient-primary)',
                      color: 'var(--primary-bg)',
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {testimonials[activeTestimonial].results}
                  </motion.div>
                </motion.div>

                {/* Rating */}
                <motion.div
                  className="flex mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="text-xl sm:text-2xl mr-1"
                      style={{ color: 'var(--electric-cyan)' }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    >
                      ★
                    </motion.span>
                  ))}
                </motion.div>

                {/* Testimonial Text */}
                <motion.p
                  className="text-base sm:text-lg md:text-xl leading-relaxed"
                  style={{ color: 'var(--text-primary)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  "{testimonials[activeTestimonial].content}"
                </motion.p>
              </div>

              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'linear-gradient(45deg, var(--electric-cyan), var(--neon-purple), var(--electric-green))',
                  backgroundSize: '300% 300%',
                  opacity: 0.1,
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.button
            onClick={prevTestimonial}
            className="absolute -left-2 sm:-left-4 top-1/2 transform -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 rounded-full glass-effect flex items-center justify-center text-lg sm:text-xl z-10 transition-colors duration-300"
            style={{ color: 'var(--electric-cyan)' }}
          >
            ←
          </motion.button>
          <motion.button
            onClick={nextTestimonial}
            className="absolute -right-2 sm:-right-4 top-1/2 transform -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 rounded-full glass-effect flex items-center justify-center text-lg sm:text-xl z-10 transition-colors duration-300"
            style={{ color: 'var(--electric-cyan)' }}
          >
            →
          </motion.button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center space-x-3 sm:space-x-4 mb-8 sm:mb-0">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeTestimonial ? 'scale-125' : 'opacity-50'
              }`}
              style={{
                background: index === activeTestimonial 
                  ? 'var(--electric-cyan)' 
                  : 'var(--text-muted)',
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Supporting Testimonials */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={`glass-effect p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                index === activeTestimonial ? 'ring-2' : ''
              }`}
              style={{
                ringColor: index === activeTestimonial ? 'var(--electric-cyan)' : 'transparent',
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => setActiveTestimonial(index)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <div
                  className="w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center mr-3 font-bold text-sm"
                  style={{ 
                    background: 'var(--gradient-secondary)',
                    color: 'var(--primary-bg)'
                  }}
                >
                  {testimonial.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>
                    {testimonial.name}
                  </h5>
                  <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                    {testimonial.company}
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm line-clamp-3" style={{ color: 'var(--text-muted)' }}>
                {testimonial.content}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
