import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, BookOpen, Play, Clock, Award, Loader } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuizzes } from '../store/quizzes/quizzesSlice';
import toast from 'react-hot-toast';
import '../styles/pages/quizzes.css';

const QuizzesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { quizzes, loading, error } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(fetchQuizzes({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.refresh) {
      dispatch(fetchQuizzes({ page: 1, limit: 100 }));
    }
  }, [location, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load quizzes: ${error}`);
    }
  }, [error]);

  const handleStartQuiz = (quizId) => {
    navigate(`/quizzes/${quizId}/take`);
  };

  const completedQuizzes = quizzes.filter(
    (quiz) => quiz.status === 'completed' || quiz.completed === true || quiz.is_completed === true
  ).length;

  const scoreValues = quizzes
    .map((quiz) => {
      if (typeof quiz.average_score === 'number') return quiz.average_score;
      if (typeof quiz.score === 'number') return quiz.score;
      if (typeof quiz.best_score === 'number') return quiz.best_score;
      if (typeof quiz.last_score === 'number') return quiz.last_score;
      return null;
    })
    .filter((score) => score !== null);

  const averageScore = scoreValues.length
    ? Math.round(scoreValues.reduce((total, score) => total + score, 0) / scoreValues.length)
    : 0;

  const totalStudyMinutes = quizzes.reduce((total, quiz) => {
    if (typeof quiz.study_time_minutes === 'number') {
      return total + quiz.study_time_minutes;
    }
    if (typeof quiz.studyTimeMinutes === 'number') {
      return total + quiz.studyTimeMinutes;
    }
    if (typeof quiz.time_spent_minutes === 'number') {
      return total + quiz.time_spent_minutes;
    }
    return total;
  }, 0);

  const studyTimeLabel =
    totalStudyMinutes >= 60
      ? `${(totalStudyMinutes / 60).toFixed(1)}h`
      : totalStudyMinutes > 0
      ? `${totalStudyMinutes}m`
      : '0m';

  return (
    <div className="page-shell quizzes">
      <div className="container">
        <header className="page-header quizzes__header">
          <div>
            <h1 className="page-heading">Quiz arena</h1>
            <p className="page-description">
              Challenge yourself with dynamic quizzes generated from your uploaded materials. Track performance and aim for mastery.
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/materials')}>
            <Plus size={18} />
            Generate from material
          </button>
        </header>

        <section className="quizzes__stats">
          <div className="quizzes__stat-card">
            <div className="quizzes__stat-icon quizzes__stat-icon--blue">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="caption">Total quizzes</span>
              <p className="quizzes__stat-value">{quizzes.length}</p>
            </div>
          </div>
          <div className="quizzes__stat-card">
            <div className="quizzes__stat-icon quizzes__stat-icon--green">
              <Award size={20} />
            </div>
            <div>
              <span className="caption">Completed</span>
              <p className="quizzes__stat-value">{completedQuizzes}</p>
            </div>
          </div>
          <div className="quizzes__stat-card">
            <div className="quizzes__stat-icon quizzes__stat-icon--purple">
              <Award size={20} />
            </div>
            <div>
              <span className="caption">Average score</span>
              <p className="quizzes__stat-value">{`${averageScore}%`}</p>
            </div>
          </div>
          <div className="quizzes__stat-card">
            <div className="quizzes__stat-icon quizzes__stat-icon--amber">
              <Clock size={20} />
            </div>
            <div>
              <span className="caption">Study time</span>
              <p className="quizzes__stat-value">{studyTimeLabel}</p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="card quizzes__loader">
            <Loader size={28} className="quizzes__loader-icon" />
            <p>Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="card quizzes__empty">
            <div className="quizzes__empty-icon">
              <BookOpen size={28} />
            </div>
            <h3>No quizzes yet</h3>
            <p>Upload a study material and generate a quiz to begin your revision journey.</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/materials')}>
              <Plus size={16} />
              Create from material
            </button>
          </div>
        ) : (
          <section className="quizzes__grid">
            {quizzes.map((quiz) => {
              const questions = quiz.total_questions || quiz.questions?.length || 0;
              const timeLimit = quiz.time_limit ? `${Math.ceil(quiz.time_limit / 60)} mins` : 'Self-paced';

              return (
                <article key={quiz.id} className="quizzes__card surface-hover">
                  <div className="quizzes__card-head">
                    <div className="quizzes__card-icon">
                      <BookOpen size={20} />
                    </div>
                    <span className="caption">Generated quiz</span>
                  </div>
                  <h3>{quiz.title}</h3>
                  {quiz.description && <p>{quiz.description}</p>}
                  <div className="quizzes__card-meta">
                    <span>{questions} questions</span>
                    <span>{timeLimit}</span>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleStartQuiz(quiz.id)}>
                    <Play size={16} />
                    Start quiz
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
