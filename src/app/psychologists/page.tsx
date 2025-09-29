'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  Star,
  MessageCircle,
  BookOpen,
  UserCheck,
  TrendingUp,
  Award,
  Mail,
  Instagram,
  ExternalLink,
  ChevronDown,
  BarChart3,
  Calendar,
  FileText,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function PsychologistsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Enhanced Client Engagement",
      description: "Keep your clients engaged between sessions with our comprehensive suite of tools and resources.",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Actionable Client Insights",
      description: "Get detailed analytics and insights about your clients' progress, patterns, and engagement levels.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Complementary Support Tool",
      description: "Enhance your practice with technology that complements your expertise, not replaces it.",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time & Increase Efficiency",
      description: "Streamline your practice with automated tools that reduce administrative burden and improve client outcomes"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Data-Driven Insights",
      description: "Make informed decisions with comprehensive analytics about client progress and treatment effectiveness"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Better Client Outcomes",
      description: "Help your clients achieve better results with 24/7 support tools and peer connections"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Professional Development",
      description: "Stay ahead with the latest mental health technology and evidence-based practices"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Clinical Psychologist",
      practice: "Mindful Therapy Center",
      text: "MindBFF has transformed how I work with my clients. The insights I get help me provide more targeted support.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Therapist",
      practice: "Wellness Collective",
      text: "My clients love having access to peer support between sessions. It's like having a support system that never sleeps.",
      rating: 5
    },
    {
      name: "Dr. Priya Patel",
      role: "Counselor",
      practice: "Healing Hearts Clinic",
      text: "The analytics help me track client progress in ways I never could before. It's a game-changer for my practice.",
      rating: 5
    }
  ];

  const stats = [
    { number: "500+", label: "Mental Health Professionals" },
    { number: "95%", label: "Client Satisfaction" },
    { number: "40%", label: "Reduced No-Shows" },
    { number: "24/7", label: "Client Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">MindBFF</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium">Features</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium">Testimonials</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium">Pricing</a>
              <Link 
                href="/"
                className="text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium"
              >
                For Users
              </Link>
              <Link 
                href="/auth/login"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        style={{ y }}
        className="pt-24 pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={isVisible ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={isVisible ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Trusted by 500+ professionals
                </motion.div>
                <motion.h1 
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight"
                  initial={{ y: 20, opacity: 0 }}
                  animate={isVisible ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Enhance Your{' '}
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                    Practice
                  </span>{' '}
                  with Technology
                </motion.h1>
                <motion.p 
                  className="text-xl text-slate-600 leading-relaxed max-w-2xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={isVisible ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Join hundreds of mental health professionals who are transforming their practice 
                  with our comprehensive platform designed specifically for therapists and counselors.
                </motion.p>
              </div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={isVisible ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link 
                  href="/auth/signup"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 group hover:scale-105"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all duration-300">
                  Schedule Demo
                </button>
              </motion.div>

              <motion.div 
                className="flex flex-wrap gap-8"
                initial={{ y: 20, opacity: 0 }}
                animate={isVisible ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">HIPAA Compliant</div>
                    <div className="text-sm text-slate-600">Your data is secure</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">24/7 Client Support</div>
                    <div className="text-sm text-slate-600">Always available</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={isVisible ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: 50, opacity: 0 }}
                        animate={isVisible ? { x: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                        className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-lg"
                      >
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-float"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="py-24 bg-slate-50/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Grow Your Practice
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools designed specifically for mental health professionals to enhance client care and streamline operations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl hover:shadow-lg transition-all duration-300 group border border-slate-200/50 hover:border-slate-300/50"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-slate-900 to-slate-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center text-white"
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">{stat.number}</div>
                <div className="text-lg text-slate-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials"
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Mental Health{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Professionals
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our platform is helping therapists and counselors provide better care to their clients.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 hover-lift"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-purple-600">{testimonial.practice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-xl text-white/90 mb-4">Start your free trial today</p>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Join hundreds of mental health professionals who are already using MindBFF to enhance their practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="mailto:partnerships@mindbff.com"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm"
              >
                <Mail className="w-5 h-5" />
                <span>Contact Sales</span>
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">MindBFF</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Empowering mental health professionals with cutting-edge technology.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors duration-200">Testimonials</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="/auth/login" className="hover:text-white transition-colors duration-200">Login</a></li>
                <li><a href="/auth/signup" className="hover:text-white transition-colors duration-200">Sign Up</a></li>
                <li><a href="mailto:support@mindbff.com" className="hover:text-white transition-colors duration-200">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
              <div className="flex space-x-4">
                <a href="mailto:hello@mindbff.com" className="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-800 rounded-lg">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://www.mindbff.com" className="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-800 rounded-lg">
                  <ExternalLink className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/mindbff" className="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-800 rounded-lg">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 MindBFF. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
