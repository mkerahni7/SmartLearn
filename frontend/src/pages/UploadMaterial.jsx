import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import api from '../services/authService';
import toast from 'react-hot-toast';
import '../styles/pages/upload.css';

/**
 * UploadMaterial - Component for uploading study materials
 * Handles file selection (drag & drop or file picker), form validation,
 * and multipart form data submission to the backend
 * @returns {JSX.Element} Upload form with drag-and-drop zone
 */
const UploadMaterial = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /**
   * Updates form state when user types in title or description fields
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handles file selection from file input
   * @param {Event} event - File input change event
   */
  const handleFileChange = (event) => {
    const selected = event.target.files && event.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  /**
   * Handles drag events for drag-and-drop file upload
   * Updates visual feedback state when user drags file over dropzone
   * @param {Event} event - Drag event (dragenter, dragover, dragleave)
   */
  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handles file drop event
   * Extracts file from dataTransfer and updates component state
   * @param {Event} event - Drop event
   */
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  /**
   * Handles form submission for file upload
   * Validates form data, creates FormData object, and sends POST request to backend
   * Navigates to materials page on success
   * @param {Event} event - Form submit event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate file selection
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    // Validate required title field
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData for multipart/form-data upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);

      // Send POST request to upload endpoint
      const response = await api.post('/api/content/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('File uploaded successfully!');
        navigate('/materials');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-shell upload">
      <div className="container">
        <header className="page-header upload__header">
          <div>
            <h1 className="page-heading">Upload study material</h1>
            <p className="page-description">
              Drop in lecture slides, notes, or documents. SmartLearn will parse them to generate flashcards and quizzes.
            </p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/materials')}>
            <X size={16} />
            Cancel
          </button>
        </header>

        <form className="upload__form" onSubmit={handleSubmit}>
          <section className="card upload__section">
            <div className="upload__field">
              <label htmlFor="title" className="form-label">
                Material title <span className="upload__required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Week 3 - Cellular Respiration Lecture"
                required
              />
            </div>

            <div className="upload__field">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="form-input"
                placeholder="Add context or chapter references..."
              />
            </div>
          </section>

          <section
            className={`card upload__dropzone ${dragActive ? 'upload__dropzone--active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="upload__file">
                <div className="upload__file-info">
                  <FileText size={24} />
                  <div>
                    <p>{file.name}</p>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button type="button" className="upload__file-remove" onClick={() => setFile(null)}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="upload__empty">
                <Upload size={40} />
                <h3>Drag and drop your file</h3>
                <p>PDF, DOCX, TXT, PPTX up to 10 MB.</p>
                <label htmlFor="file-picker" className="btn btn-primary btn-sm">
                  Browse files
                </label>
                <input
                  type="file"
                  id="file-picker"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                  onChange={handleFileChange}
                  hidden
                />
              </div>
            )}
          </section>

          <section className="card upload__info">
            <div className="upload__info-icon">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3>Supported formats</h3>
              <p>We parse your material to extract key concepts, summaries, and question candidates.</p>
              <ul>
                <li>PDF documents (.pdf)</li>
                <li>Word documents (.doc, .docx)</li>
                <li>PowerPoint decks (.ppt, .pptx)</li>
                <li>Plain text files (.txt)</li>
              </ul>
            </div>
          </section>

          <div className="upload__actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/materials')} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading || !file}>
              {isUploading ? (
                <>
                  <div className="spinner" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload material
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterial;

