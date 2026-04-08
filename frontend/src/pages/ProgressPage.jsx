import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, Target, Calendar, Award, Flame, BookOpen, Brain, GraduationCap, Loader } from 'lucide-react';
import api from '../services/authService';
import toast from 'react-hot-toast';
import '../styles/pages/progress.css';

const ProgressPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/auth/users/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-shell progress">
        <div className="container">
          <div className="card progress__loader">
            <Loader className="progress__loader-icon" />
            <p>Loading your progress…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-shell progress">
        <div className="container">
          <div className="card progress__loader">
            <p>No progress data available yet. Complete an activity to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Study streak', value: stats.studyStreak || 0, suffix: ' days', icon: Flame, tone: 'orange' },
    { title: 'Total points', value: stats.totalPoints || 0, suffix: '', icon: Target, tone: 'blue' },
    { title: 'Level', value: stats.level || 1, suffix: '', icon: TrendingUp, tone: 'purple' },
    { title: 'Materials uploaded', value: stats.totalMaterials || 0, suffix: '', icon: BookOpen, tone: 'green' }
  ];

  const secondaryStats = [
    { label: 'Flashcards', value: stats.totalFlashcards || 0, icon: Brain },
    { label: 'Quizzes', value: stats.totalQuizzes || 0, icon: GraduationCap },
    { label: 'Quiz attempts', value: stats.totalQuizAttempts || 0, icon: BarChart3 }
  ];

  const hasActivity = Array.isArray(stats.activity) && stats.activity.length > 0;
  const hasPerformance = Array.isArray(stats.performance) && stats.performance.length > 0;
  const hasAchievements = Array.isArray(stats.achievements) && stats.achievements.length > 0;

  return (
    <div className="page-shell progress">
      <div className="container progress__container">
        <header className="progress__header">
          <div>
            <h1>Your learning pulse</h1>
            <p>Visualize streaks, XP gains, and achievements as you move towards mastery.</p>
          </div>
          <div className="progress__badge">
            <span>Level {stats.level || 1}</span>
          </div>
        </header>

        <section className="progress__stats">
          {statCards.map(({ title, value, suffix, icon: Icon, tone }) => (
            <div key={title} className={`progress__stat-card progress__stat-card--${tone}`}>
              <div className="progress__stat-icon">
                <Icon size={20} />
              </div>
              <div>
                <span className="caption">{title}</span>
                <p>
                  {value}
                  {suffix}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="progress__secondary">
          {secondaryStats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card progress__secondary-card">
              <div className="progress__secondary-icon">
                <Icon size={20} />
              </div>
              <div>
                <span className="caption">{label}</span>
                <p>{value}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="progress__charts">
          <div className="card progress__chart">
            <div className="progress__chart-header">
              <TrendingUp size={20} />
              <h2>Study activity (last 7 days)</h2>
            </div>
            {hasActivity ? (
              <div className="progress__chart-bars">
                {stats.activity.map((minutes, index, arr) => {
                  const max = Math.max(...arr, 1);
                  const height = Math.max((minutes / max) * 100, 8);
                  return (
                    <div key={`activity-${index}`} className="progress__chart-bar" title={`Day ${index + 1}: ${minutes} minutes`}>
                      <span style={{ height: `${height}%` }} />
                      <small>D{index + 1}</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="progress__chart-empty">No study activity recorded yet.</div>
            )}
          </div>

          <div className="card progress__chart">
            <div className="progress__chart-header">
              <BarChart3 size={20} />
              <h2>Performance trends</h2>
            </div>
            {hasPerformance ? (
              <div className="progress__chart-bars progress__chart-bars--purple">
                {stats.performance.map((score, index) => (
                  <div key={`performance-${index}`} className="progress__chart-bar" title={`Attempt ${index + 1}: ${score}%`}>
                    <span style={{ height: `${Math.max(score, 8)}%` }} />
                    <small>{score}%</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="progress__chart-empty">Take quizzes to see your performance growth.</div>
            )}
          </div>
        </section>

        <section className="card progress__achievements">
          <div className="progress__chart-header">
            <Award size={20} />
            <h2>Recent achievements</h2>
          </div>
          {hasAchievements ? (
            <div className="progress__achievement-grid">
              {stats.achievements.map((achievement) => (
                <div key={achievement.title} className="progress__achievement">
                  <div className="progress__achievement-icon">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3>{achievement.title}</h3>
                    <p>
                      <Calendar size={14} />
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span>+{achievement.points} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="progress__chart-empty progress__chart-empty--inline">
              Keep learning to earn badges and milestones.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProgressPage;
