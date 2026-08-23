import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';

// Layouts
import { StudentLayout } from '../components/layout/StudentLayout';
import { InstructorLayout } from '../components/layout/InstructorLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Auth
import { LoginPage } from '../pages/auth/LoginPage';

// Student Pages
import { ExplorePage } from '../pages/student/ExplorePage';
import { CourseListingPage } from '../pages/student/CourseListingPage';
import { CourseDetailPage } from '../pages/student/CourseDetailPage';
import { MyCertificatesPage } from '../pages/student/MyCertificatesPage';
import { MyLearningPage } from '../pages/student/MyLearningPage';
import { CoursePlayerPage } from '../pages/student/CoursePlayerPage';
import { QuizIntroPage } from '../pages/student/QuizIntroPage';
import { QuizTakingPage } from '../pages/student/QuizTakingPage';
import { QuizResultPage } from '../pages/student/QuizResultPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

// Instructor Pages
import { InstructorDashboard } from '../pages/instructor/InstructorDashboard';
import { CourseCreateWizardPage } from '../pages/instructor/CourseCreateWizardPage';
import { CourseEditorPage } from '../pages/instructor/CourseEditorPage';
import { QuizBuilderPage } from '../pages/instructor/QuizBuilderPage';
import { StudentProgressPage } from '../pages/instructor/StudentProgressPage';
import { InstructorProfilePage } from '../pages/instructor/InstructorProfilePage';

// Admin Pages
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { CourseApprovalPage } from '../pages/admin/CourseApprovalPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage initialMode="login" />} />
      <Route path="/register" element={<LoginPage initialMode="register" />} />

      {/* Standalone Player & Quiz Routes (Cover full screen) */}
      <Route
        path="/learn/:courseId"
        element={
          <ProtectedRoute>
            <CoursePlayerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute>
            <QuizIntroPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId/take"
        element={
          <ProtectedRoute>
            <QuizTakingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId/result"
        element={
          <ProtectedRoute>
            <QuizResultPage />
          </ProtectedRoute>
        }
      />

      {/* Student / Public Layout Routes */}
      <Route element={<StudentLayout />}>
        {/* Public Catalog Routes */}
        <Route path="/" element={<ExplorePage />} />
        <Route path="/courses" element={<CourseListingPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/certificates" element={<MyCertificatesPage />} />

        {/* Protected Student Routes */}
        <Route
          path="/my-learning"
          element={
            <ProtectedRoute>
              <MyLearningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Instructor Portal Routes */}
      <Route
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['ROLE_INSTRUCTOR', 'ROLE_ADMIN', 'INSTRUCTOR', 'ADMIN']}>
              <InstructorLayout />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/instructor" element={<Navigate to="/instructor/dashboard" replace />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/courses/create" element={<CourseCreateWizardPage />} />
        <Route path="/instructor/courses/:courseId/edit" element={<CourseEditorPage />} />
        <Route path="/instructor/courses/:courseId/quiz-builder" element={<QuizBuilderPage />} />
        <Route path="/instructor/students" element={<StudentProgressPage />} />
        <Route path="/instructor/profile" element={<InstructorProfilePage />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN']}>
              <AdminLayout />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminOverviewPage />} />
        <Route path="/admin/courses/approval" element={<CourseApprovalPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
