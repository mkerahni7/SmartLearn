import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Brain, RotateCcw, CheckCircle, Loader, Sparkles } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFlashcards } from '../store/flashcards/flashcardsSlice';
import toast from 'react-hot-toast';
import '../styles/pages/flashcards.css';

/**
 * FlashcardsPage - Component for viewing and studying flashcards
 * Displays all user flashcards with flip animation functionality
 * Fetches flashcards from API and manages flip state for each card
 * @returns {JSX.Element} Grid of flashcard cards with flip interactions
 */
const FlashcardsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { flashcards, loading, error } = useSelector((state) => state.flashcards);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    dispatch(fetchFlashcards({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Refetch when navigating from materials page
  useEffect(() => {
    if (location.state?.refresh) {
      dispatch(fetchFlashcards({ page: 1, limit: 100 }));
      // Clear the refresh state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load flashcards: ${error}`);
    }
  }, [error]);

  const handleToggleCard = (cardId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleCardKeyDown = (event, cardId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleCard(cardId);
    }
  };

  return (
    <div className="page-shell flashcards">
      <div className="container">
        <header className="page-header flashcards__header">
          <div>
            <h1 className="page-heading">Flashcards workspace</h1>
            <p className="page-description">
              Review AI-generated cards, track mastery, and build new sets from your study materials.
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/flashcards/create')}>
            <Plus size={18} />
            Generate new set
          </button>
        </header>

        <section className="card flashcards__summary" data-variant="elevated">
          <div className="flashcards__summary-icon">
            <Brain size={28} />
          </div>
          <div>
            <h2>Daily review tip</h2>
            <p>Keep your streak alive by revising at least 15 cards a day. SmartLearn prioritizes topics you struggle with.</p>
          </div>
          <div className="flashcards__summary-actions">
            <button type="button" className="btn btn-primary btn-sm">
              <RotateCcw size={16} />
              Start adaptive review
            </button>
            <button type="button" className="btn btn-outline btn-sm">
              <CheckCircle size={16} />
              Quick recall test
            </button>
          </div>
        </section>

        {loading ? (
          <div className="card flashcards__loader">
            <Loader size={24} className="flashcards__loader-icon" />
            <p>Collecting your flashcard sets...</p>
          </div>
        ) : flashcards.length === 0 ? (
          <div className="card flashcards__empty">
            <div className="flashcards__empty-icon">
              <Brain size={28} />
            </div>
            <h3>No flashcards yet</h3>
            <p>
              Generate cards from your study materials to begin spaced repetition. SmartLearn will highlight key concepts
              automatically.
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/flashcards/create')}>
              <Plus size={16} />
              Create your first set
            </button>
          </div>
        ) : (
          <section className="flashcards__grid">
            {flashcards.map((card) => {
              const question = card.front_text || card.frontText || 'No question provided';
              const answer = card.back_text || card.backText || 'No answer provided yet';
              const difficulty = card.difficulty_level || card.difficultyLevel || 1;
              const isFlipped = Boolean(flippedCards[card.id]);

              return (
                <article
                  key={card.id}
                  className={`flashcards__card ${isFlipped ? 'flashcards__card--flipped' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggleCard(card.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, card.id)}
                  aria-pressed={isFlipped}
                  aria-label={`Flashcard difficulty ${difficulty}. ${isFlipped ? 'Showing answer' : 'Showing question'}.`}
                >
                  <div className="flashcards__card-inner">
                    <div className="flashcards__card-face flashcards__card-face--front">
                      <div className="flashcards__card-header">
                        <div className="flashcards__card-icon">
                          <Brain size={20} />
                        </div>
                        <span className="caption">Difficulty {difficulty}</span>
                      </div>
                      <h3>{question}</h3>
                      <p className="flashcards__hint">Tap or press space to reveal the answer.</p>
                      <div className="flashcards__card-meta">
                        <span className="flashcards__badge">{card.times_reviewed || 0} reviews</span>
                        <span className="flashcards__badge flashcards__badge--success">
                          {card.correct_answers || 0} remembered
                        </span>
                      </div>
                    </div>

                    <div className="flashcards__card-face flashcards__card-face--back">
                      <div className="flashcards__card-header">
                        <div className="flashcards__card-icon flashcards__card-icon--inverse">
                          <Sparkles size={20} />
                        </div>
                        <span className="caption">Answer</span>
                      </div>
                      <p className="flashcards__answer">{answer}</p>
                      <div className="flashcards__card-meta flashcards__card-meta--back">
                        <span className="flashcards__badge">Tap to flip back</span>
                        <span className="flashcards__badge flashcards__badge--accent">Keep practicing!</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;
