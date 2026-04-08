import React from 'react';
import { Lock, Shield, Eye } from 'lucide-react';
import '../styles/pages/legal.css';

const PrivacyPage = () => {
  return (
    <div className="page-shell legal">
      <div className="legal__container">
        <header className="legal__header">
          <span className="legal__badge">
            <Lock size={16} />
            SmartLearn Privacy
          </span>
          <h1>Privacy Policy</h1>
          <p>
            Your learning data is personal. This policy explains what we collect, how we use it to personalize your
            experience, and the choices you have over your information.
          </p>
        </header>

        <section className="legal__section">
          <h2>1. What we collect</h2>
          <p>
            When you register, we ask for your name, username, and email. As you use SmartLearn, we store uploaded study
            materials, generated flashcards, quiz results, and progress statistics so you can pick up right where you
            left off.
          </p>
        </section>

        <section className="legal__section">
          <h2>2. How we use your data</h2>
          <ul className="legal__list">
            <li>Generate personalized flashcards and quizzes from your uploads.</li>
            <li>Track streaks, points, and levels so you can measure improvement.</li>
            <li>Securely authenticate you and keep your session active.</li>
            <li>Improve SmartLearn by understanding which features are most helpful.</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>3. Data protection</h2>
          <p>
            We encrypt passwords, use secure connections, and limit employee access. If we suspect unauthorized activity
            on your account, we will let you know promptly.
          </p>
        </section>

        <section className="legal__section">
          <h2>4. Your choices</h2>
          <p>
            You can update profile details anytime, request a copy of your data, or ask us to delete your account by
            emailing <a href="mailto:privacy@smartlearn.app">privacy@smartlearn.app</a>. We honor these requests except
            when the law requires us to keep certain records.
          </p>
        </section>

        <section className="legal__section">
          <h2>5. Third parties</h2>
          <p>
            We do not sell your data. We may use trusted processors (such as cloud hosting) to operate the platform, and
            they must follow strict confidentiality and security commitments.
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

export default PrivacyPage;

