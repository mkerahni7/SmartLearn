import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';
import '../styles/pages/auth.css';

const RegisterPage = () => {
  const { register: registerUser, isAuthenticated, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser(data);
    setIsLoading(false);

    if (result.success && result.autoLogin) {
      navigate('/dashboard', { replace: true });
    }
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: password && password.length >= 6 },
    { text: 'Contains letters and numbers', met: password && /^(?=.*[A-Za-z])(?=.*\d)/.test(password) }
  ];

  const perks = [
    { icon: Sparkles, text: 'Automated flashcard and quiz generation' },
    { icon: Award, text: 'Gamified achievements and streak tracking' },
    { icon: Layers, text: 'Organized study materials with smart tagging' }
  ];

  return (
    <div className="auth">
      <div className="container auth__container">
        <aside className="auth__intro">
          <span className="chip chip--soft auth__badge">
            <Sparkles size={16} />
            Join SmartLearn
          </span>
          <h1 className="auth__title">
            Build your <span className="text-gradient">ultimate study hub</span> in minutes.
          </h1>
          <p className="auth__subtitle">
            Upload materials, generate flashcards, craft quizzes, and track progress in one beautiful workspace.
          </p>

          <div className="auth__grid">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div className="auth__pill" key={perk.text}>
                  <Icon size={18} />
                  <span>{perk.text}</span>
                </div>
              );
            })}
          </div>

          <div className="auth__switch">
            Already part of SmartLearn?
            <Link to="/login">Sign in instead</Link>
          </div>
        </aside>

        <section className="auth__card">
          <header className="auth__card-header">
            <div className="auth__icon">
              <User size={20} />
            </div>
            <div>
              <h2>Create your account</h2>
              <p>Fill in your details to access the SmartLearn experience.</p>
            </div>
          </header>

          <form className="auth__form" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="auth__alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth__two-column">
              <div className="auth__field">
                <label htmlFor="firstName" className="form-label">
                  First name
                </label>
                <div className="auth__input-wrapper">
                  <User size={18} />
                  <input
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      }
                    })}
                    id="firstName"
                    type="text"
                    className={`form-input auth__input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Layla"
                  />
                </div>
                {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
              </div>

              <div className="auth__field">
                <label htmlFor="lastName" className="form-label">
                  Last name
                </label>
                <div className="auth__input-wrapper">
                  <User size={18} />
                  <input
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters'
                      }
                    })}
                    id="lastName"
                    type="text"
                    className={`form-input auth__input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Hassan"
                  />
                </div>
                {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="auth__field">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="auth__input-wrapper">
                <User size={18} />
                <input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores'
                    }
                  })}
                  id="username"
                  type="text"
                  className={`form-input auth__input ${errors.username ? 'error' : ''}`}
                  placeholder="layla98"
                />
              </div>
              {errors.username && <p className="form-error">{errors.username.message}</p>}
            </div>

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

            <div className="auth__two-column">
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
                    placeholder="Create a secure password"
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
                {password && (
                  <div className="auth__requirements">
                    {passwordRequirements.map((req) => (
                      <div className="auth__requirement" key={req.text}>
                        {req.met ? <CheckCircle size={14} color="#16a34a" /> : <span className="auth__dot" />}
                        <span className={req.met ? 'auth__requirement--met' : ''}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="auth__field">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm password
                </label>
                <div className="auth__input-wrapper">
                  <Lock size={18} />
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-input auth__input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    className="auth__toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="auth__terms">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth__submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create SmartLearn account'
              )}
            </button>

            <p className="auth__footnote">
              We protect your data with industry-standard encryption. You can update your details anytime in your profile.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;

