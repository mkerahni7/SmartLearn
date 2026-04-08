import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sparkles, Shield, Clock } from 'lucide-react';
import '../styles/pages/auth.css';

const LoginPage = () => {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (location.state?.fromRegister) {
      toast.success('Account created successfully! Please sign in.');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data);
    setIsLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth">
      <div className="container auth__container">
        <aside className="auth__intro">
          <span className="chip chip--soft auth__badge">
            <Sparkles size={16} />
            Welcome back
          </span>
          <h1 className="auth__title">
            Your<span className="text-gradient"> study control center</span> is one sign-in away.
          </h1>
          <p className="auth__subtitle">
            Access your flashcards, quizzes, streaks, and collaborative spaces designed to keep you exam-ready.
          </p>

          <div className="auth__highlights">
            <div className="auth__highlight">
              <Shield size={18} />
              <span>Secure single sign-on with JWT protection</span>
            </div>
            <div className="auth__highlight">
              <Clock size={18} />
              <span>Instant resume of your latest study session</span>
            </div>
          </div>

          <div className="auth__switch">
            <span>Need a SmartLearn workspace?</span>
            <Link to="/register">Create a free account</Link>
          </div>
        </aside>

        <section className="auth__card">
          <header className="auth__card-header">
            <div className="auth__icon">
              <Lock size={20} />
            </div>
            <div>
              <h2>Sign in</h2>
              <p>Welcome back! Please enter your credentials.</p>
            </div>
          </header>

          <form className="auth__form" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="auth__alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth__field">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="auth__input-wrapper">
                <Mail size={18} />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  id="email"
                  type="email"
                  className={`form-input auth__input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="auth__field">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="auth__input-wrapper">
                <Lock size={18} />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input auth__input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="auth__toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <div className="auth__options">
              <label className="auth__checkbox">
                <input type="checkbox" id="remember-me" name="remember-me" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth__link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth__submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in to SmartLearn'
              )}
            </button>

            <p className="auth__footnote">
              By continuing, you agree to our <span>Terms</span> and <span>Privacy Policy</span>.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
