import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { quizService } from '../services/quizService';
import toast from 'react-hot-toast';
import '../styles/pages/take-quiz.css';

/**
 * TakeQuizPage - Component for taking quizzes
 * Displays quiz questions one at a time with timer, tracks answers, and calculates score
 * Fetches quiz data from API and handles quiz submission
 * @returns {JSX.Element} Quiz interface with questions, timer, and results display
 */
const TakeQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [score, setScore] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz?.timeLimit || quiz?.time_limit) {
      setTimeLeft(quiz.timeLimit || quiz.time_limit);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      // Request quiz with shuffle=true to get randomized questions and options
      // This ensures each time the quiz is taken, questions and answers are in different order
      const response = await quizService.getQuiz(quizId, true);
      const quizData = response.data?.data || response.data;
      setQuiz(quizData);

      // Questions are already shuffled by the backend
      const questionsData = quizData?.questions || [];
      
      // Parse options from JSON string if needed
      const processedQuestions = questionsData.map((question) => {
        // Parse options if it's a JSON string
        let options = question.options;
        if (typeof options === 'string') {
          try {
            options = JSON.parse(options);
          } catch (e) {
            // If parsing fails, try to split by comma or use as-is
            options = options.includes(',') ? options.split(',').map(s => s.trim()) : [options];
          }
        }
        
        return {
          ...question,
          options: Array.isArray(options) ? options : [],
        };
      });
      
      setQuestions(processedQuestions);
      
      if (processedQuestions.length === 0) {
        console.warn('No questions found in quiz data');
        toast.error('This quiz has no questions');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load quiz';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = useCallback((questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }, []);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Convert answers object to array format expected by backend
      // Backend expects: [answerIndex1, answerIndex2, ...] for each question in order
      const answersArray = questions.map((q) => {
        const userAnswer = answers[q.id];
        // Find the index of the user's answer in the question's options
        if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
          return -1; // No answer provided
        }
        
        // Parse options if it's a string (JSON)
        const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
        
        // If userAnswer is already an index, return it
        if (typeof userAnswer === 'number') {
          return userAnswer;
        }
        
        // If userAnswer is text, find its index in options
        const index = options.findIndex((opt) => opt === userAnswer || opt === String(userAnswer));
        return index >= 0 ? index : -1;
      });

      // Submit quiz answers (backend expects array of answer indices)
      const result = await quizService.submitQuiz(quizId, answersArray);
      
      // Use score from backend response
      const finalScore = result.data?.data?.score || result.data?.score || 0;
      const correct = result.data?.data?.correctAnswers || result.data?.correctAnswers || 0;

      setScore(finalScore);
      setCorrectAnswers(correct);
      toast.success(`Quiz completed! Score: ${finalScore}%`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit quiz';
      toast.error(`Failed to submit quiz: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allQuestionsAnswered = () => {
    return questions.length > 0 && questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '');
  };

  if (isLoading) {
    return (
      <div className="page-shell take-quiz">
        <div className="container">
          <div className="card take-quiz__loader">
            <div className="spinner" />
            <p>Loading quiz…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="page-shell take-quiz">
        <div className="container">
          <div className="card take-quiz__empty">
            <XCircle size={32} />
            <h2>Quiz unavailable</h2>
            <p>This quiz is missing or doesn’t contain any questions.</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/quizzes')}>
              Back to quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (score !== null) {
    return (
      <div className="page-shell take-quiz">
        <div className="container">
          <div className="card take-quiz__result">
            <div className="take-quiz__result-icon">
              {score >= 70 ? <CheckCircle size={48} /> : <XCircle size={48} />}
            </div>
            <h2>Quiz complete!</h2>
            <p>Your Score</p>
            <div className="take-quiz__result-score">{score}%</div>
            <span>
              {questions.length} questions • {correctAnswers} correct
            </span>
            <div className="take-quiz__result-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/quizzes')}>
                Back to quizzes
              </button>
              <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                Retake quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  let options = [];
  if (currentQ?.options) {
    try {
      options =
        typeof currentQ.options === 'string'
          ? JSON.parse(currentQ.options)
          : Array.isArray(currentQ.options)
          ? currentQ.options
          : [];
    } catch (error) {
      options = [];
    }
  }

  return (
    <div className="page-shell take-quiz">
      <div className="container take-quiz__container">
        <header className="take-quiz__header">
          <button type="button" className="take-quiz__back" onClick={() => navigate('/quizzes')}>
            <ArrowLeft size={18} />
            Back to quizzes
          </button>
          <div className="take-quiz__title">
            <h1>{quiz.title}</h1>
            {quiz.description && <p>{quiz.description}</p>}
          </div>
          {quiz.time_limit && (
            <div className={`take-quiz__timer ${timeLeft < 60 ? 'take-quiz__timer--warning' : ''}`}>
              <Clock size={18} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </header>

        <div className="take-quiz__progress">
          <div className="take-quiz__progress-meta">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete</span>
          </div>
          <div className="take-quiz__progress-bar">
            <span style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <section className="card take-quiz__question">
          <h2>{currentQ.questionText || currentQ.question_text}</h2>
          <div className="take-quiz__options">
            {options.map((option, index) => {
              const isSelected = answers[currentQ.id] === option;
              return (
                <button
                  key={`${currentQ.id}-${index}`}
                  type="button"
                  className={`take-quiz__option ${isSelected ? 'take-quiz__option--active' : ''}`}
                  onClick={() => handleAnswerChange(currentQ.id, option)}
                >
                  <div className="take-quiz__option-index">{String.fromCharCode(65 + index)}</div>
                  <div className="take-quiz__option-text">{option}</div>
                  {isSelected && <CheckCircle size={18} />}
                </button>
              );
            })}
          </div>
        </section>

        <footer className="take-quiz__footer">
          <button type="button" className="btn btn-outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            Previous
          </button>

          <div className="take-quiz__steps">
            {questions.map((question, index) => {
              const answered = answers[question.id] !== undefined && answers[question.id] !== '';
              const isCurrent = index === currentQuestion;
              return (
                <button
                  type="button"
                  key={question.id}
                  className={`take-quiz__step ${isCurrent ? 'take-quiz__step--current' : ''} ${
                    answered ? 'take-quiz__step--answered' : ''
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !allQuestionsAnswered()}
            >
              {isSubmitting ? 'Submitting…' : allQuestionsAnswered() ? 'Submit quiz' : 'Answer all questions'}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              Next
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default TakeQuizPage;

