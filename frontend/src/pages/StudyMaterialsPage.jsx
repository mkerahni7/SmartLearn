import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Image, Video, Trash2, Brain, BookOpen } from 'lucide-react';
import { contentService } from '../services/contentService';
import toast from 'react-hot-toast';
import '../styles/pages/materials.css';

const StudyMaterialsPage = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await contentService.getMaterials();
      let materialsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          materialsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          materialsData = response.data.data;
        }
      }
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load study materials');
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMaterials();
      return;
    }

    try {
      setIsLoading(true);
      const response = await contentService.searchMaterials(searchQuery);
      let searchResults = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          searchResults = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          searchResults = response.data.data;
        }
      }
      setMaterials(searchResults);
    } catch (error) {
      console.error('Error searching materials:', error);
      toast.error('Search failed');
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await contentService.deleteMaterial(id);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const handleGenerateFlashcards = async (materialId) => {
    try {
      const response = await contentService.generateFlashcards(materialId);
      const count = response.data?.data?.length || response.data?.length || 0;
      toast.success(`Successfully generated ${count} flashcard${count !== 1 ? 's' : ''}!`);
      // Add small delay to ensure backend has saved the flashcards
      setTimeout(() => {
        navigate('/flashcards', { state: { refresh: true } });
      }, 500);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to generate flashcards';
      toast.error(`Flashcard generation failed: ${errorMsg}`);
    }
  };

  const handleGenerateQuiz = async (materialId) => {
    try {
      setIsLoading(true);
      await contentService.generateQuiz(materialId);
      toast.success('Quiz generated! Head to Quizzes to take it.');
      navigate('/quizzes', { state: { refresh: true } });
    } catch (error) {
      console.error('Error generating quiz:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to generate quiz';
      toast.error(`Failed to generate quiz: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    if (filterType === 'all') return true;
    return material.type === filterType;
  });

  return (
    <div className="page-shell materials">
      <div className="container">
        <header className="page-header materials__header">
          <div>
            <h1 className="page-heading">Study materials hub</h1>
            <p className="page-description">
              Upload class slides, notes, and documents. SmartLearn will transform them into interactive study tools.
            </p>
          </div>
          <Link to="/materials/upload" className="btn btn-primary btn-lg">
            <Plus size={18} />
            Upload material
          </Link>
        </header>

        <section className="card materials__filters" data-variant="elevated">
          <div className="materials__filters-grid">
            <div className="materials__search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by title, subject, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="materials__controls">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All types</option>
                <option value="note">Notes</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleSearch}>
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="card materials__loader">
            <div className="loading-spinner" />
            <p>Loading your study materials...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="card materials__empty">
            <div className="materials__empty-icon">
              <FileText size={24} />
            </div>
            <h3>No materials yet</h3>
            <p>
              {searchQuery
                ? 'No results found. Try refining your keywords.'
                : 'Upload your first material to generate flashcards and quizzes instantly.'}
            </p>
            <Link to="/materials/upload" className="btn btn-primary btn-sm">
              <Plus size={16} />
              Add material
            </Link>
          </div>
        ) : (
          <section className="materials__grid">
            {filteredMaterials.map((material) => {
              const createdDate = material.created_at ? new Date(material.created_at).toLocaleDateString() : 'Recently';
              const MaterialIcon = material.type === 'image' ? Image : material.type === 'video' ? Video : FileText;

              return (
                <article key={material.id} className="materials__card surface-hover">
                  <div className="materials__card-head">
                    <div className={`materials__card-icon materials__card-icon--${material.type || 'document'}`}>
                      <MaterialIcon size={20} />
                    </div>
                    <div className="materials__card-meta">
                      <span className="caption">{createdDate}</span>
                      <span className="materials__chip">{material.type || 'document'}</span>
                      {material.category && <span className="materials__chip materials__chip--accent">{material.category}</span>}
                    </div>
                  </div>
                  <h3>{material.title || 'Untitled material'}</h3>
                  {material.description && <p>{material.description}</p>}

                  <div className="materials__card-actions">
                    <button
                      type="button"
                      className="materials__action materials__action--flashcards"
                      onClick={() => handleGenerateFlashcards(material.id)}
                    >
                      <Brain size={16} />
                      Generate flashcards
                    </button>
                    <button
                      type="button"
                      className="materials__action materials__action--quiz"
                      onClick={() => handleGenerateQuiz(material.id)}
                    >
                      <BookOpen size={16} />
                      Generate quiz
                    </button>
                    <button
                      type="button"
                      className="materials__action materials__action--danger"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
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

export default StudyMaterialsPage;
