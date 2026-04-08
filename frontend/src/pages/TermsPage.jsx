import React from 'react';
import { ShieldCheck, Scale, FileText } from 'lucide-react';
import '../styles/pages/legal.css';

const TermsPage = () => {
  return (
    <div className="page-shell legal">
      <div className="legal__container">
        <header className="legal__header">
          <span className="legal__badge">
            <ShieldCheck size={16} />
            SmartLearn Terms
          </span>
          <h1>Terms of Service</h1>
          <p>
            Welcome to SmartLearn! These terms outline the rules and responsibilities that keep our learning community
            safe, respectful, and productive. By creating an account or using the platform, you agree to the statements
            below.
          </p>
        </header>

        <section className="legal__section">
          <h2>1. Using SmartLearn</h2>
          <p>
            SmartLearn lets you upload study materials, generate flashcards and quizzes, and track your progress. You
            must be at least 13 years old, provide accurate information, and maintain the security of your account
            credentials.
          </p>
        </section>

        <section className="legal__section">
          <h2>2. Your content and intellectual property</h2>
          <p>
            You retain ownership of the files and notes you upload. By submitting content, you grant us permission to
            process it solely to generate learning aids for you. Please make sure you have the right to share any
            content you upload.
          </p>
        </section>

        <section className="legal__section">
          <h2>3. Community standards</h2>
          <p>
            We want SmartLearn to remain a positive environment. You agree not to upload harmful content, violate any
            laws, or attempt to disrupt the platform. We reserve the right to suspend accounts that break these rules.
          </p>
        </section>

        <section className="legal__section">
          <h2>4. Availability and updates</h2>
          <p>
            We strive to keep SmartLearn running smoothly, but occasional maintenance or outages may occur. Features may
            evolve over time, and we might update these terms to reflect improvements or legal changes.
          </p>
        </section>

        <section className="legal__section">
          <h2>5. Contact</h2>
          <p>
            Have questions about the terms? Reach our team at{' '}
            <a href="mailto:support@smartlearn.app">support@smartlearn.app</a> — we are happy to help.
          </p>
        </section>

        <footer className="legal__footer">
          <strong>Last updated:</strong>
          <span>November 9, 2025</span>
        </footer>
      </div>
    </div>
  );
};

export default TermsPage;

