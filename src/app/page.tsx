'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Search,
  GraduationCap,
  Shield,
  CheckCircle,
  ArrowRight,
  Play,
  Globe,
  Lock,
  BarChart3
} from 'lucide-react';
import '../styles/landing.scss';
import { ScrollAnimations } from '../components/ScrollAnimations';
import Link from 'next/link';

export default function LandingPage() {
  const scrollToAuth = (tab: 'login' | 'signup' = 'login') => {
    window.location.href = `/auth?tab=${tab}`;
  };

  const roles = [
    {
      icon: GraduationCap,
      title: 'Students',
      description: 'Get mentorship, build your network, find opportunities',
      color: '#6366f1'
    },
    {
      icon: Users,
      title: 'Alumni',
      description: 'Give back, connect, share experiences',
      color: '#10b981'
    },
    {
      icon: Shield,
      title: 'Professors',
      description: 'Collaborate, guide, and build communities',
      color: '#f59e0b'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Choose Role',
      description: 'Create your account and select your role in the academic community'
    },
    {
      number: '02',
      title: 'Get Verified by Your College',
      description: 'Your institution verifies your identity for secure connections'
    },
    {
      number: '03',
      title: 'Start Connecting & Scheduling',
      description: 'Find mentors, schedule calls, and build meaningful relationships'
    }
  ];

  const features = [
    {
      icon: Lock,
      title: 'College-Verified Access',
      description: 'Only verified students and alumni from your institution'
    },
    {
      icon: MessageSquare,
      title: 'Secure Messaging',
      description: 'Approved conversations with built-in safety controls'
    },
    {
      icon: Calendar,
      title: 'Scheduled Calls',
      description: 'Book video calls with approval workflow'
    }
  ];

  return (
    <div className="landing-page">
      <ScrollAnimations />
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h2>ConnectED</h2>
          </div>
          <nav className="nav">
            <button className="nav-btn" onClick={() => scrollToAuth('login')}>Login</button>
            <button className="nav-btn primary" onClick={() => scrollToAuth('signup')}>Sign Up</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            {...({} as any)}
          >
            <h1 className="hero-title">
              Connect with Your <span className="highlight">Academic Community</span>
            </h1>
            <p className="hero-subtitle">
              Join ConnectED to build meaningful relationships with students, alumni, and professors. 
              Share experiences, find mentors, and grow your professional network.
            </p>
            <div className="hero-actions">
              <Link href="/auth" className="btn btn-primary">
                Get Started
              </Link>
              <Link href="#features" className="btn btn-outline">
                Learn More
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            {...({} as any)}
          >
            <div className="mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-card">
                  <div className="mockup-avatar">JD</div>
                  <div className="mockup-info">
                    <h4>John Doe</h4>
                    <p>Student • Computer Science</p>
                  </div>
                </div>
                <div className="mockup-stats">
                  <div className="stat">
                    <span className="stat-number">24</span>
                    <span className="stat-label">Connections</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">8</span>
                    <span className="stat-label">Calls</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Role Highlights */}
      <section className="roles">
        <div className="container">
          <motion.div 
            className="section-header scroll-fade-up"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            {...({} as any)}
          >
            <h2>Who Is This For?</h2>
            <p>Join thousands of students and alumni making meaningful connections</p>
          </motion.div>
          
          <div className="roles-grid">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.title}
                  className="role-card scroll-scale"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  {...({} as any)}
                >
                  <div className="role-icon">
                    <Icon size={32} />
                  </div>
                  <h3 className="role-title">{role.title}</h3>
                  <p className="role-description">{role.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <motion.div 
            className="section-header scroll-fade-up"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            {...({} as any)}
          >
            <h2>How It Works</h2>
            <p>Get started in just three simple steps</p>
          </motion.div>
          
          <div className="steps-grid">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="step-card scroll-fade-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                {...({} as any)}
              >
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="security">
        <div className="container">
          <motion.div 
            className="section-header scroll-fade-up"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            {...({} as any)}
          >
            <h2>Security & Trust</h2>
            <p>Your privacy and security are our top priorities</p>
          </motion.div>
          
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="feature-card scroll-fade-right"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  {...({} as any)}
                >
                  <div className="feature-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <motion.div 
            className="cta-content scroll-rotate"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            {...({} as any)}
          >
            <h2>Ready to Start Connecting?</h2>
            <p>Join thousands of students and alumni making meaningful connections.</p>
            <button className="cta-btn primary large" onClick={() => scrollToAuth('signup')}>
              Get Started Now
              <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ConnectED</h3>
              <p>Connecting academic communities through meaningful relationships and professional development opportunities.</p>
            </div>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 ConnectED. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
