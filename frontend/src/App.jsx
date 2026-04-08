import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { store } from './store/store';
import client from './api/graphql/client';
import './App.css';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudyMaterialsPage from './pages/StudyMaterialsPage.jsx';
import UploadMaterial from './pages/UploadMaterial.jsx';
import FlashcardsPage from './pages/FlashcardsPage.jsx';
import CreateFlashcardPage from './pages/CreateFlashcardPage.jsx';
import QuizzesPage from './pages/QuizzesPage.jsx';
import TakeQuizPage from './pages/TakeQuizPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import StudyRoomsPage from './pages/StudyRoomsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
          <div className="App app-gradient-shell">
            <Navbar />
            <main className="app-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/materials" element={
                  <ProtectedRoute>
                    <StudyMaterialsPage />
                  </ProtectedRoute>
                } />
                <Route path="/materials/upload" element={
                  <ProtectedRoute>
                    <UploadMaterial />
                  </ProtectedRoute>
                } />
                <Route path="/flashcards" element={
                  <ProtectedRoute>
                    <FlashcardsPage />
                  </ProtectedRoute>
                } />
                <Route path="/flashcards/create" element={
                  <ProtectedRoute>
                    <CreateFlashcardPage />
                  </ProtectedRoute>
                } />
                <Route path="/quizzes" element={
                  <ProtectedRoute>
                    <QuizzesPage />
                  </ProtectedRoute>
                } />
                <Route path="/quizzes/:quizId/take" element={
                  <ProtectedRoute>
                    <TakeQuizPage />
                  </ProtectedRoute>
                } />
                <Route path="/progress" element={
                  <ProtectedRoute>
                    <ProgressPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/rooms" element={
                  <ProtectedRoute>
                    <StudyRoomsPage />
                  </ProtectedRoute>
                } />
                
                {/* 404 page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
      </ApolloProvider>
    </ReduxProvider>
  );
}

export default App;

