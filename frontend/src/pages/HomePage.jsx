import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Brain,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Zap,
  Target,
  Star
} from 'lucide-react';
import '../styles/pages/home.css';

/**
 * HomePage - Landing page component for SmartLearn
 * Displays marketing content, feature highlights, and call-to-action buttons
 * Shows different content based on authentication status
 * @returns {JSX.Element} Landing page with hero section, features, and CTAs
 */
const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const featureCards = [
    {
      icon: BookOpen,
      title: 'Unified library',
      description: 'Upload PDFs, DOCX, PPTX, and notes. SmartLearn cleans and prepares them for fast studying.',
      accent: 'primary'
    },
    {
      icon: Brain,
      title: 'AI flashcards',
      description: 'Instantly generate accurate Q&A decks with context-aware prompts and flip animations.',
      accent: 'purple'
    },
    {
      icon: Target,
      title: 'Adaptive quizzes',
      description: 'Produce 10-question assessments matched to your material difficulty and track mastery.',
      accent: 'aqua'
    },
    {
      icon: BarChart3,
      title: 'Progress radar',
      description: 'Visualize streaks, XP, levels, and knowledge gaps with a live analytics board.',
      accent: 'amber'
    }
  ];

  const highlights = [
    'Curated study flows that transform static notes into interactive lessons',
    'Gamified achievements to keep you motivated during long semesters',
    'Collaborative workspaces for sharing decks, quizzes, and insight',
    'Mobile-ready interface so you can revise on the go',
    'Secure cloud storage with instant file parsing',
    'Deep analytics to predict where to focus next'
  ];

  const stats = [
    { value: '12.5k', label: 'Active learners' },
    { value: '58k', label: 'Smart decks generated' },
    { value: '94%', label: 'Reported grade improvement' }
  ];

  const testimonials = [
    {
      quote:
        'I uploaded a semester of PDFs and instantly received quizzes that matched my professor’s exam style. My revision time dropped in half.',
      name: 'Layla H.',
      role: 'Pharmacy student'
    },
    {
      quote:
        'Flashcards are usually tedious. SmartLearn builds them in seconds with precise definitions. I finally keep my streak alive.',
      name: 'Omar K.',
      role: 'Computer science major'
    }
  ];

  return (
    <div className="home">
      <section className="home__hero">
        <div className="container home__hero-inner">
          <div className="home__hero-content">
            <span className="chip chip--ghost">
              <Sparkles size={16} />
              Next-gen study co-pilot
            </span>
            <h1 className="home__title">
              Study <span className="text-gradient">smarter, faster, together.</span>
            </h1>
            <p className="home__subtitle">
              SmartLearn turns class notes into interactive flashcards, adaptive quizzes, and visual progress dashboards.
              Stay exam-ready with workflows designed for ambitious learners.
            </p>
            <div className="home__cta">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Open dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Create free account
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    I already have an account
                  </Link>
                </>
              )}
            </div>
            <div className="home__hero-highlights">
              {stats.map((stat) => (
                <div key={stat.label} className="home__stat">
                  <span className="home__stat-value">{stat.value}</span>
                  <span className="home__stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="home__hero-preview">
            <div className="home__preview-card">
              <div className="home__preview-header">
                <span className="caption">Weekly focus</span>
                <span className="home__preview-score">
                  92
                  <span className="caption">/100</span>
                </span>
              </div>

              <div className="home__preview-grid">
                <div className="home__preview-tile">
                  <span className="home__tile-label">Streak</span>
                  <span className="home__tile-value">
                    14<span className="caption">days</span>
                  </span>
                  <span className="home__tile-meta">+3 this week</span>
                </div>
                <div className="home__preview-tile">
                  <span className="home__tile-label">Decks mastered</span>
                  <span className="home__tile-value">36</span>
                  <span className="home__tile-meta">4 pending review</span>
                </div>
                <div className="home__preview-tile home__preview-tile--accent">
                  <Star size={18} />
                  <div>
                    <span className="home__tile-label">Achievement unlocked</span>
                    <span className="home__tile-meta">“Relentless reviser”</span>
                  </div>
                </div>
              </div>

              <div className="home__preview-progress">
                <div className="home__progress-label">
                  <span>Retention index</span>
                  <span>78%</span>
                </div>
                <div className="home__progress-bar">
                  <span style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home__section">
        <div className="container">
          <div className="home__section-header">
            <span className="chip chip--soft">
              <Target size={16} />
              Core platform
            </span>
            <h2 className="home__section-title">Everything your study routine needs in one workspace.</h2>
            <p className="home__section-subtitle">
              SmartLearn blends automation with control. Generate rich learning content instantly and keep the power to
              refine every card, quiz, and milestone.
            </p>
          </div>

          <div className="home__feature-grid">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className={`home__feature-card home__feature-card--${feature.accent}`}>
                  <div className="home__feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home__section home__section--alt">
        <div className="container">
          <div className="home__split">
            <div className="home__split-content">
              <span className="chip chip--ghost">
                <Zap size={16} />
                Built for ambitious learners
              </span>
              <h2 className="home__section-title">Why students switch to SmartLearn.</h2>
              <div className="home__list">
                {highlights.map((item) => (
                  <div className="home__list-item" key={item}>
                    <CheckCircle size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="home__split-card">
              <div className="home__card-header">
                <span className="chip chip--soft">
                  <Users size={16} />
                  Peer praise
                </span>
                <span className="caption">4.9/5 satisfaction</span>
              </div>
              <div className="home__testimonial-list">
                {testimonials.map((testimonial) => (
                  <blockquote className="home__testimonial" key={testimonial.name}>
                    “{testimonial.quote}”
                    <footer>
                      <span className="home__testimonial-name">{testimonial.name}</span>
                      <span className="home__testimonial-role">{testimonial.role}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home__cta">
        <div className="container home__cta-inner">
          <div>
            <h2>Ready to unlock your study superpowers?</h2>
            <p>Join SmartLearn now and build flashcards, quizzes, and analytics dashboards in seconds.</p>
          </div>
          {!isAuthenticated && (
            <div className="home__cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start for free
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign in to your workspace
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="home__footer">
        <div className="container home__footer-inner">
          <div className="home__footer-brand">
            <div className="home__footer-mark">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="home__footer-title">SmartLearn</span>
              <span className="home__footer-subtitle">Interactive learning engine</span>
            </div>
          </div>
          <div className="home__footer-links">
            <div>
              <h4>Platform</h4>
              <ul>
                <li>Study materials</li>
                <li>Flashcards</li>
                <li>Quizzes</li>
                <li>Progress</li>
              </ul>
            </div>
            <div>
              <h4>Resources</h4>
              <ul>
                <li>Support</li>
                <li>Documentation</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
            <div>
              <h4>Connect</h4>
              <ul>
                <li>Community</li>
                <li>Careers</li>
                <li>Twitter</li>
                <li>LinkedIn</li>
              </ul>
            </div>
          </div>
          <p className="home__footer-copy">© {new Date().getFullYear()} SmartLearn. Crafted for advanced learners.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

