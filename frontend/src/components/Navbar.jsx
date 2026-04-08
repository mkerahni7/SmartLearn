import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Brain,
  BarChart3,
  Users
} from 'lucide-react';

/**
 * Navbar - Navigation component for the application
 * Displays main navigation links, user menu, and mobile menu toggle
 * Conditionally renders based on authentication status
 * @returns {JSX.Element} Navigation bar with links and user menu
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/materials', label: 'Materials', icon: FileText },
    { path: '/flashcards', label: 'Flashcards', icon: Brain },
    { path: '/quizzes', label: 'Quizzes', icon: BookOpen },
    { path: '/rooms', label: 'Study Rooms', icon: Users },
    { path: '/progress', label: 'Progress', icon: BarChart3 }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <div className="navbar__brand-mark">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="navbar__brand-name">SmartLearn</span>
            <span className="navbar__brand-tagline">Master smarter, not harder</span>
          </div>
        </Link>

        <nav className="navbar__links">
          {isAuthenticated ? (
            navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`navbar__link ${active ? 'navbar__link--active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })
          ) : (
            <Link to="/" className="navbar__link">
              <Home size={18} />
              <span>Home</span>
            </Link>
          )}
        </nav>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <div className="navbar__profile">
              <button
                type="button"
                className="navbar__profile-trigger"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <div className="navbar__avatar">
                  <User size={18} />
                </div>
                <div className="navbar__profile-info">
                  <span className="navbar__profile-name">{user?.username}</span>
                  <span className="navbar__profile-role">Learner</span>
                </div>
              </button>

              <div className="navbar__profile-menu">
                <Link to="/profile" className="navbar__profile-item" onClick={() => setIsMobileMenuOpen(false)}>
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <button type="button" className="navbar__profile-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create account
              </Link>
            </div>
          )}

          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`navbar__mobile ${isMobileMenuOpen ? 'navbar__mobile--open' : ''}`}>
        <div className="navbar__mobile-content">
          {isAuthenticated ? (
            <>
              <div className="navbar__mobile-user">
                <div className="navbar__avatar navbar__avatar--xl">
                  <User size={22} />
                </div>
                <div>
                  <p className="navbar__mobile-name">{user?.firstName || user?.username}</p>
                  <p className="navbar__mobile-email">{user?.email}</p>
                </div>
              </div>

              <div className="navbar__mobile-links">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`navbar__mobile-link ${active ? 'navbar__mobile-link--active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="navbar__mobile-footer">
                <Link
                  to="/profile"
                  className="navbar__mobile-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button type="button" className="navbar__mobile-link" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="navbar__mobile-auth">
              <Link to="/login" className="btn btn-secondary btn-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
