import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { User, Mail, Calendar, Award, Edit, LogOut, Lock, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import '../styles/pages/profile.css';

const getInitialForm = (user) => ({
  firstName: user?.first_name ?? user?.firstName ?? '',
  lastName: user?.last_name ?? user?.lastName ?? '',
  username: user?.username ?? '',
  email: user?.email ?? ''
});

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(getInitialForm(user));
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    setFormData(getInitialForm(user));
  }, [user?.first_name, user?.last_name, user?.username, user?.email]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(getInitialForm(user));
    setIsEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email
      };

      const response = await authService.updateProfile(payload);
      const updatedUser = response.data?.data?.user;

      if (updatedUser) {
        updateUser(updatedUser);
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayFirstName = user?.first_name ?? user?.firstName ?? '';
  const displayLastName = user?.last_name ?? user?.lastName ?? '';
  const fullName = [displayFirstName, displayLastName].filter(Boolean).join(' ') || user?.username || 'Learner';
  const usernameLabel = user?.username ? `@${user.username}` : '';
  const emailDisplay = user?.email || 'Not provided';
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently joined';
  const level = user?.level || 1;
  const points = user?.total_points ?? user?.totalPoints ?? 0;

  const handleOpenModal = (modalId) => {
    setActiveModal(modalId);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const renderActiveModal = () => {
    switch (activeModal) {
      case 'security':
        return <SecurityModal onClose={handleCloseModal} />;
      case 'email':
        return <EmailPreferencesModal onClose={handleCloseModal} />;
      case 'privacy':
        return <PrivacyControlsModal onClose={handleCloseModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="page-shell profile">
      <div className="container profile__container">
        <header className="profile__header">
          <div className="profile__avatar">
            <User size={36} />
          </div>
          <div>
            <h1>{fullName}</h1>
            <p>{usernameLabel}</p>
          </div>
          {isEditing ? (
            <div className="profile__header-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" form="profile-edit-form" className="btn btn-primary btn-sm" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
              <Edit size={16} />
              Edit profile
            </button>
          )}
        </header>

        <section className="profile__grid">
          <div className="card profile__info">
            <h2>Account overview</h2>
            {isEditing ? (
              <form id="profile-edit-form" className="profile__form" onSubmit={handleSave}>
                <div className="profile__form-row">
                  <label>
                    <span>First name</span>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                    />
                  </label>
                  <label>
                    <span>Last name</span>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                    />
                  </label>
                </div>
                <div className="profile__form-row">
                  <label>
                    <span>Username</span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="username"
                      required
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                    />
                  </label>
                </div>
              </form>
            ) : (
              <div className="profile__info-row">
                <div className="profile__info-item">
                  <Mail size={18} />
                  <div>
                    <span className="caption">Email</span>
                    <p>{emailDisplay}</p>
                  </div>
                </div>
                <div className="profile__info-item">
                  <Calendar size={18} />
                  <div>
                    <span className="caption">Member since</span>
                    <p>{memberSince}</p>
                  </div>
                </div>
                <div className="profile__info-item">
                  <Award size={18} />
                  <div>
                    <span className="caption">Level</span>
                    <p>
                      Level {level} • {points} XP
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card profile__settings">
            <h2>Quick settings</h2>
            <div className="profile__setting-list">
              <button
                type="button"
                onClick={() => handleOpenModal('security')}
                aria-haspopup="dialog"
                aria-expanded={activeModal === 'security'}
              >
                <div>
                  <Lock size={18} />
                  <span>Security & password</span>
                </div>
                <Edit size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleOpenModal('email')}
                aria-haspopup="dialog"
                aria-expanded={activeModal === 'email'}
              >
                <div>
                  <Mail size={18} />
                  <span>Email preferences</span>
                </div>
                <Edit size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleOpenModal('privacy')}
                aria-haspopup="dialog"
                aria-expanded={activeModal === 'privacy'}
              >
                <div>
                  <ShieldCheck size={18} />
                  <span>Privacy controls</span>
                </div>
                <Edit size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="card profile__actions">
          <div>
            <h2>Need a break?</h2>
            <p>Sign out securely and jump back in when you’re ready to keep learning.</p>
          </div>
          <button type="button" className="btn btn-danger btn-sm" onClick={logout}>
            <LogOut size={16} />
            Sign out
          </button>
        </section>
        {renderActiveModal()}
      </div>
    </div>
  );
};

const ProfileModalShell = ({ title, description, onClose, children }) => (
  <div className="profile-modal__overlay" role="dialog" aria-modal="true" aria-label={title}>
    <div className="profile-modal">
      <header className="profile-modal__header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        <button type="button" className="profile-modal__close" onClick={onClose} aria-label="Close settings">
          <X size={18} />
        </button>
      </header>
      <div className="profile-modal__body">{children}</div>
    </div>
  </div>
);

const SecurityModal = ({ onClose }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    toast.success('Security settings saved.');
    onClose();
  };

  return (
    <ProfileModalShell
      title="Security & password"
      description="Keep your account safe by updating your password and enabling two-factor authentication."
      onClose={onClose}
    >
      <form className="profile-modal__form" onSubmit={handleSubmit}>
        <label>
          <span>Current password</span>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
          />
        </label>
        <label>
          <span>New password</span>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Create a strong password"
          />
        </label>
        <label>
          <span>Confirm new password</span>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat new password"
          />
        </label>
        <label className="profile-modal__switch">
          <input type="checkbox" name="twoFactor" checked={form.twoFactor} onChange={handleChange} />
          <span>
            Enable 2FA <small>Protect your account with a verification code on login.</small>
          </span>
        </label>
        <div className="profile-modal__actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Save changes
          </button>
        </div>
      </form>
    </ProfileModalShell>
  );
};

const EmailPreferencesModal = ({ onClose }) => {
  const [preferences, setPreferences] = useState({
    productUpdates: true,
    studyReminders: true,
    newsletter: false
  });

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setPreferences((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success('Email preferences updated.');
    onClose();
  };

  return (
    <ProfileModalShell
      title="Email preferences"
      description="Choose the updates and reminders you want to see in your inbox."
      onClose={onClose}
    >
      <form className="profile-modal__form" onSubmit={handleSubmit}>
        <label className="profile-modal__checkbox">
          <input type="checkbox" name="productUpdates" checked={preferences.productUpdates} onChange={handleChange} />
          <span>
            Product updates <small>Feature releases, improvements, and important announcements.</small>
          </span>
        </label>
        <label className="profile-modal__checkbox">
          <input type="checkbox" name="studyReminders" checked={preferences.studyReminders} onChange={handleChange} />
          <span>
            Study reminders <small>Weekly study digests and streak nudges to keep you on track.</small>
          </span>
        </label>
        <label className="profile-modal__checkbox">
          <input type="checkbox" name="newsletter" checked={preferences.newsletter} onChange={handleChange} />
          <span>
            Monthly newsletter <small>Curated learning tips, inspiring stories, and best practices.</small>
          </span>
        </label>
        <div className="profile-modal__actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Save preferences
          </button>
        </div>
      </form>
    </ProfileModalShell>
  );
};

const PrivacyControlsModal = ({ onClose }) => {
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showProgress: true,
    showFlashcards: false
  });

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setPrivacy((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success('Privacy controls updated.');
    onClose();
  };

  return (
    <ProfileModalShell
      title="Privacy controls"
      description="Control what other learners can see about your progress and shared content."
      onClose={onClose}
    >
      <form className="profile-modal__form" onSubmit={handleSubmit}>
        <label className="profile-modal__switch">
          <input type="checkbox" name="profilePublic" checked={privacy.profilePublic} onChange={handleChange} />
          <span>
            Public profile <small>Allow other learners to find and follow your progress.</small>
          </span>
        </label>
        <label className="profile-modal__switch">
          <input type="checkbox" name="showProgress" checked={privacy.showProgress} onChange={handleChange} />
          <span>
            Share learning stats <small>Display your streaks, levels, and badges on your profile.</small>
          </span>
        </label>
        <label className="profile-modal__switch">
          <input type="checkbox" name="showFlashcards" checked={privacy.showFlashcards} onChange={handleChange} />
          <span>
            Share flashcard sets <small>Let study groups access the flashcards you create.</small>
          </span>
        </label>
        <div className="profile-modal__actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Apply controls
          </button>
        </div>
      </form>
    </ProfileModalShell>
  );
};

export default ProfilePage;
