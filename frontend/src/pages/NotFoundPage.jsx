import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import '../styles/pages/not-found.css';

const NotFoundPage = () => (
  <div className="page-shell not-found">
    <div className="container not-found__container">
      <div className="card not-found__card">
        <span className="not-found__code">404</span>
        <h1>Looks like you took a detour</h1>
        <p>The page you’re looking for doesn’t exist or has been moved. Let’s get you back on track.</p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn-primary btn-sm">
            <Home size={18} />
            Go home
          </Link>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
