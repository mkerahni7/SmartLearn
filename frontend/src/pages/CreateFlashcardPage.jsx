import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, RotateCcw, Save, AlertCircle, Brain } from 'lucide-react';
import { contentService } from '../services/contentService';
import toast from 'react-hot-toast';
import '../styles/pages/create-flashcards.css';

/**
 * CreateFlashcardPage - Component for generating flashcards from study materials
 * Allows users to select a material and trigger AI-powered flashcard generation
 * Displays generated flashcards with preview and save functionality
 * @returns {JSX.Element} Flashcard generation interface with material selection
 */
const CreateFlashcardPage = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('description', 'Generated flashcards from uploaded file');

      const uploadResponse = await contentService.uploadFile(formData);
      const material = uploadResponse.data?.data || uploadResponse.data;
      const materialId = material.id;

      const response = await contentService.generateFlashcards(materialId);
      const generatedFlashcards = response.data?.data || response.data || [];
      setFlashcards(generatedFlashcards);
      toast.success(`Generated ${generatedFlashcards.length} flashcards!`);
    } catch (err) {
      console.error('Error generating flashcards:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate flashcards';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setFlashcards([]);
    setFile(null);
    setError(null);
  };

  return (
    <div className="page-shell create-flashcards">
      <div className="container">
        <header className="page-header create-flashcards__header">
          <div>
            <h1 className="page-heading">Generate flashcards</h1>
            <p className="page-description">
              Upload a study file and let SmartLearn craft high-quality Q&A pairs for active recall.
            </p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/flashcards')}>
            Back to flashcards
          </button>
        </header>

        {error && (
          <div className="card create-flashcards__alert">
            <div className="create-flashcards__alert-icon">
              <AlertCircle size={18} />
            </div>
            <div>
              <h3>Error generating flashcards</h3>
              <p>{error}</p>
            </div>
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {flashcards.length === 0 ? (
          <section className="card create-flashcards__upload" data-variant="elevated">
            <div className="create-flashcards__upload-header">
              <Sparkles size={24} />
              <div>
                <h2>Upload study material</h2>
                <p>Supported formats: PDF, DOCX, TXT, PPT, PPTX up to 10 MB.</p>
              </div>
            </div>

            <div
              className={`create-flashcards__dropzone ${dragActive ? 'create-flashcards__dropzone--active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="create-flashcards__file">
                  <div>
                    <p>{file.name}</p>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button type="button" onClick={() => setFile(null)}>
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="create-flashcards__dropzone-empty">
                  <Upload size={36} />
                  <h3>Drag and drop your file</h3>
                  <p>or click below to browse</p>
                  <label htmlFor="flashcard-file-picker" className="btn btn-primary btn-sm">
                    Select file
                  </label>
                  <input
                    id="flashcard-file-picker"
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <div className="create-flashcards__actions">
              <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={!file || isGenerating}>
                Reset
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateFlashcards}
                disabled={!file || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="spinner" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate flashcards
                  </>
                )}
              </button>
            </div>
          </section>
        ) : (
          <section className="create-flashcards__results">
            <div className="card create-flashcards__results-header">
              <div className="create-flashcards__results-icon">
                <Brain size={24} />
              </div>
              <div>
                <h2>{flashcards.length} flashcards ready</h2>
                <p>Click any card to flip between the prompt and the answer.</p>
              </div>
              <div className="create-flashcards__results-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
                  <RotateCcw size={16} />
                  Regenerate
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/flashcards')}>
                  <Save size={16} />
                  View in library
                </button>
              </div>
            </div>

            <div className="create-flashcards__grid">
              {flashcards.map((card, index) => (
                <Flashcard key={`flashcard-${index}`} card={card} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const Flashcard = ({ card, index }) => {
  const [flipped, setFlipped] = useState(false);
  const front = card.front_text || card.front || 'No question available';
  const back = card.back_text || card.back || 'No answer available';

  return (
    <div className={`create-flashcards__card ${flipped ? 'create-flashcards__card--flipped' : ''}`} onClick={() => setFlipped((prev) => !prev)}>
      <div className="create-flashcards__card-face create-flashcards__card-face--front">
        <span className="caption">Question {index + 1}</span>
        <p>{front}</p>
        <small>Tap to reveal answer</small>
      </div>
      <div className="create-flashcards__card-face create-flashcards__card-face--back">
        <span className="caption">Answer</span>
        <p>{back}</p>
        <small>Tap to go back</small>
      </div>
    </div>
  );
};

export default CreateFlashcardPage;

