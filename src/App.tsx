import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import { ThemeProvider } from './core/context/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { CategoryPage } from './pages/CategoryPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AskPage } from './pages/AskPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SavedPage } from './pages/SavedPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { LegalPage } from './pages/LegalPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Full Landing Page */}
            <Route
              path="/about"
              element={
                <MainLayout showSidebar={false}>
                  <LandingPage />
                </MainLayout>
              }
            />

            {/* Home Feed */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />

            {/* Discover Topics */}
            <Route
              path="/discover"
              element={
                <MainLayout>
                  <DiscoverPage />
                </MainLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <MainLayout>
                  <DiscoverPage />
                </MainLayout>
              }
            />

            {/* Category Page */}
            <Route
              path="/category/:slug"
              element={
                <MainLayout>
                  <CategoryPage />
                </MainLayout>
              }
            />

            {/* Question Detail */}
            <Route
              path="/question/:questionId"
              element={
                <MainLayout>
                  <QuestionDetailPage />
                </MainLayout>
              }
            />

            {/* User Profile */}
            <Route
              path="/user/:username"
              element={
                <MainLayout>
                  <UserProfilePage />
                </MainLayout>
              }
            />

            {/* Ask Question */}
            <Route
              path="/ask"
              element={
                <MainLayout showSidebar={false}>
                  <AskPage />
                </MainLayout>
              }
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={
                <MainLayout>
                  <NotificationsPage />
                </MainLayout>
              }
            />

            {/* Saved Items */}
            <Route
              path="/saved"
              element={
                <MainLayout>
                  <SavedPage />
                </MainLayout>
              }
            />
            <Route
              path="/following"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />

            {/* Search */}
            <Route
              path="/search"
              element={
                <MainLayout>
                  <SearchPage />
                </MainLayout>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <MainLayout>
                  <SettingsPage />
                </MainLayout>
              }
            />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <MainLayout showSidebar={false}>
                  <AuthPage initialMode="login" />
                </MainLayout>
              }
            />
            <Route
              path="/signup"
              element={
                <MainLayout showSidebar={false}>
                  <AuthPage initialMode="signup" />
                </MainLayout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <MainLayout showSidebar={false}>
                  <AuthPage initialMode="forgot" />
                </MainLayout>
              }
            />

            {/* Legal and Safety */}
            <Route
              path="/guidelines"
              element={
                <MainLayout>
                  <LegalPage />
                </MainLayout>
              }
            />
            <Route
              path="/terms"
              element={
                <MainLayout>
                  <LegalPage />
                </MainLayout>
              }
            />
            <Route
              path="/privacy"
              element={
                <MainLayout>
                  <LegalPage />
                </MainLayout>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
