import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contentService } from '../services/contentService';
import { flashcardService } from '../services/flashcardService';
import { quizService } from '../services/quizService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Brain,
  BarChart3,
  Plus,
  TrendingUp,
  Target,
  Calendar,
  Award,
  Flame,
  Users
} from 'lucide-react';
import '../styles/pages/dashboard.css';

/**
 * DashboardPage - Main dashboard for authenticated users
 * Displays user statistics, recent activity, achievements, and quick access to materials
 * Fetches data from multiple API endpoints and aggregates for display
 * @returns {JSX.Element} Dashboard with stats cards, achievements, and activity feed
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    studyStreak: 0,
    totalPoints: 0,
    level: 1
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [materialsResponse, flashcardsResponse, quizzesResponse, statsResponse] = await Promise.all([
          contentService.getMaterials().catch(() => ({ data: [] })),
          flashcardService.getFlashcards().catch(() => ({ data: [] })),
          quizService.getQuizzes().catch(() => ({ data: [] })),
          authService.getUserStats().catch(() => null)
        ]);

        const materials = Array.isArray(materialsResponse.data?.data || materialsResponse.data)
          ? materialsResponse.data?.data || materialsResponse.data
          : [];
        const flashcards = Array.isArray(flashcardsResponse.data?.data || flashcardsResponse.data)
          ? flashcardsResponse.data?.data || flashcardsResponse.data
          : [];
        const quizzes = Array.isArray(quizzesResponse.data?.data || quizzesResponse.data)
          ? quizzesResponse.data?.data || quizzesResponse.data
          : [];

        const statsData = statsResponse?.data?.data || {};
        const combinedStats = {
          totalMaterials: statsData.totalMaterials ?? materials.length,
          totalFlashcards: statsData.totalFlashcards ?? flashcards.length,
          totalQuizzes: statsData.totalQuizzes ?? quizzes.length,
          studyStreak: statsData.studyStreak ?? user?.study_streak ?? 0,
          totalPoints: statsData.totalPoints ?? user?.total_points ?? 0,
          level: statsData.level ?? user?.level ?? 1
        };

        setStats({
          totalMaterials: combinedStats.totalMaterials,
          totalFlashcards: combinedStats.totalFlashcards,
          totalQuizzes: combinedStats.totalQuizzes,
          studyStreak: combinedStats.studyStreak,
          totalPoints: combinedStats.totalPoints,
          level: combinedStats.level
        });

        setAchievements(Array.isArray(statsData.achievements) ? statsData.achievements : []);

        const activities = materials.slice(0, 5).map((material, idx) => ({
          id: material.id || idx,
          type: 'material',
          title: material.title || 'Untitled Material',
          date: material.created_at ? new Date(material.created_at).toLocaleDateString() : 'Recently'
        }));
        setRecentActivity(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setStats((prev) => ({
          ...prev,
          studyStreak: user?.study_streak || 0,
          totalPoints: user?.total_points || 0,
          level: user?.level || 1
        }));
        setRecentActivity([]);
        setAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const quickActions = [
    {
      title: 'Add study material',
      description: 'Upload notes, slides, or articles. We will prep them instantly.',
      icon: Plus,
      link: '/materials',
      accent: 'blue'
    },
    {
      title: 'Create flashcards',
      description: 'Generate interactive decks and edit them with one click.',
      icon: Brain,
      link: '/flashcards',
      accent: 'purple'
    },
    {
      title: 'Take a quiz',
      description: 'Build 10-question quizzes tailored to your material.',
      icon: BookOpen,
      link: '/quizzes',
      accent: 'green'
    },
    {
      title: 'View progress',
      description: 'Check streaks, XP, and achievements across your subjects.',
      icon: BarChart3,
      link: '/progress',
      accent: 'amber'
    }
  ];

  const achievementIconMap = {
    'first-week': Calendar,
    'quiz-master': Award,
    'flashcard-pro': Brain
  };

  if (isLoading) {
    return (
      <div className="page-shell dashboard">
        <div className="container page-shell__loading">
          <div className="loading-spinner" />
          <p>Preparing your learning space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell dashboard">
      <div className="container">
        <header className="page-header dashboard__header">
          <div>
            <h1 className="page-heading">Welcome back, {user?.firstName || user?.username} 👋</h1>
            <p className="page-description">
              Continue your smart learning journey—keep the streak alive and conquer your next milestone today.
            </p>
          </div>
          <div className="dashboard__hero-card">
            <div>
              <span className="caption">Active streak</span>
              <p className="dashboard__streak-value">
                {stats.studyStreak}
                <span>days</span>
              </p>
            </div>
            <div className="dashboard__streak-icon">
              <Flame size={28} />
            </div>
          </div>
        </header>

        <section className="stat-grid">
          <div className="stat-card">
            <div className="icon-bubble">
              <Target size={22} />
            </div>
            <h4>Total points</h4>
            <span className="stat-value">{stats.totalPoints}</span>
            <p className="dashboard__stat-footnote">XP earned across all study modes</p>
          </div>
          <div className="stat-card">
            <div className="icon-bubble">
              <TrendingUp size={22} />
            </div>
            <h4>Current level</h4>
            <span className="stat-value">Lv. {stats.level}</span>
            <p className="dashboard__stat-footnote">Keep practicing to unlock the next badge</p>
          </div>
          <div className="stat-card">
            <div className="icon-bubble">
              <BookOpen size={22} />
            </div>
            <h4>Study materials</h4>
            <span className="stat-value">{stats.totalMaterials}</span>
            <p className="dashboard__stat-footnote">Files ready for flashcards and quizzes</p>
          </div>
          <div className="stat-card">
            <div className="icon-bubble">
              <Brain size={22} />
            </div>
            <h4>Flashcards</h4>
            <span className="stat-value">{stats.totalFlashcards}</span>
            <p className="dashboard__stat-footnote">Interactive cards generated so far</p>
          </div>
        </section>

        <section className="dashboard__actions card" data-variant="elevated">
          <div className="dashboard__section-head">
            <div>
              <h2>Quick launch</h2>
              <p>Pick up where you left off or create something new in seconds.</p>
            </div>
          </div>
          <div className="dashboard__action-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className={`dashboard__action-card dashboard__action-card--${action.accent}`}
                >
                  <div className="dashboard__action-icon">
                    <Icon size={20} />
                  </div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <span className="dashboard__action-cta">Open workspace</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="dashboard__grid">
          <div className="card dashboard__activity-card">
            <div className="dashboard__section-head">
              <div>
                <h2>Recent activity</h2>
                <p>Latest materials you have uploaded or reviewed.</p>
              </div>
            </div>
            <div className="dashboard__activity-list">
              {recentActivity.length === 0 && (
                <div className="dashboard__empty">
                  <p>No activity yet</p>
                  <span>Upload a study material to get started.</span>
                </div>
              )}
              {recentActivity.map((activity) => (
                <div key={activity.id} className="dashboard__activity-item">
                  <div className={`dashboard__activity-icon dashboard__activity-icon--${activity.type}`}>
                    {activity.type === 'quiz' && <BookOpen size={16} />}
                    {activity.type === 'flashcard' && <Brain size={16} />}
                    {activity.type === 'material' && <BookOpen size={16} />}
                  </div>
                  <div className="dashboard__activity-content">
                    <p>{activity.title}</p>
                    <span>{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card dashboard__achievements">
            <div className="dashboard__section-head">
              <div>
                <h2>Achievements</h2>
                <p>Track your progress and unlock new badges.</p>
              </div>
            </div>
            <div className="dashboard__achievement-list">
              {achievements.length === 0 ? (
                <div className="dashboard__empty">
                  <p>No achievements unlocked yet — start learning to earn badges!</p>
                  <Link to="/materials" className="btn btn-primary btn-sm">
                    Start studying
                  </Link>
                </div>
              ) : (
                achievements.map((achievement) => {
                  const Icon = achievementIconMap[achievement.id] || Target;
                  return (
                    <div
                      key={achievement.id || achievement.title}
                      className={`dashboard__achievement ${achievement.earned ? 'dashboard__achievement--earned' : ''}`}
                    >
                      <div className="dashboard__achievement-icon">
                        <Icon size={18} />
                      </div>
                      <div className="dashboard__achievement-content">
                        <h3>{achievement.title}</h3>
                        <p>{achievement.description}</p>
                        <div className="dashboard__progress">
                          <span style={{ width: `${achievement.progress}%` }} />
                        </div>
                        <span className="dashboard__progress-value">
                          {achievement.progress}% complete
                          {typeof achievement.currentValue === 'number' && typeof achievement.targetValue === 'number' ? (
                            <small>
                              {' '}
                              • {achievement.currentValue}/{achievement.targetValue}
                            </small>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="card dashboard__groups">
          <div className="dashboard__section-head">
            <div>
              <h2>Study groups</h2>
              <p>Collaborate live with classmates working on the same material.</p>
            </div>
            <button type="button" className="btn btn-outline btn-sm">
              <Users size={16} />
              Join group
            </button>
          </div>

          <div className="dashboard__groups-empty">
            <div className="dashboard__groups-icon">
              <Users size={28} />
            </div>
            <h3>No groups yet</h3>
            <p>Open a collaborative workspace when you invite classmates.</p>
            <button type="button" className="btn btn-primary btn-sm">
              Create a study group
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
