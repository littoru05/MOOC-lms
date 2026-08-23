import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthModal } from './components/auth/AuthModal';

// Dedicated Layouts for 3 Roles
import { StudentLayout } from './components/layout/StudentLayout';
import { InstructorLayout } from './components/layout/InstructorLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Student Pages
import { ExplorePage } from './pages/student/ExplorePage';
import { CourseListingPage } from './pages/student/CourseListingPage';
import { CourseDetailPage } from './pages/student/CourseDetailPage';
import { CoursePlayerPage } from './pages/student/CoursePlayerPage';
import { QuizIntroPage } from './pages/student/QuizIntroPage';
import { QuizTakingPage } from './pages/student/QuizTakingPage';
import { QuizResultPage } from './pages/student/QuizResultPage';
import { MyCertificatesPage } from './pages/student/MyCertificatesPage';
import { MyLearningPage } from './pages/student/MyLearningPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Instructor Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { CourseCreateWizardPage } from './pages/instructor/CourseCreateWizardPage';
import { CourseEditorPage } from './pages/instructor/CourseEditorPage';
import { QuizBuilderPage } from './pages/instructor/QuizBuilderPage';
import { StudentProgressPage } from './pages/instructor/StudentProgressPage';
import { InstructorProfilePage } from './pages/instructor/InstructorProfilePage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { CourseApprovalPage } from './pages/admin/CourseApprovalPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

function AppContent() {
  const { currentRole } = useAuth();
  const [currentTab, setCurrentTab] = useState('student-explore');
  const [exploreFilterQuery, setExploreFilterQuery] = useState('');
  const [activeCourseSlug, setActiveCourseSlug] = useState('fullstack-spring-boot-reactjs');
  const [activeCourseId, setActiveCourseId] = useState(1);
  const [activeQuizId, setActiveQuizId] = useState(1);
  const [activeEnrollmentId, setActiveEnrollmentId] = useState(null);
  const [quizResultData, setQuizResultData] = useState(null);
  const [initialCertCode, setInitialCertCode] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('LOGIN');

  // When session expires, redirect to explore tab and prompt login modal
  React.useEffect(() => {
    const handleAuthExpired = () => {
      setCurrentTab('student-explore');
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const handleOpenAuthModal = (mode = 'LOGIN') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };


  const handleAuthSuccess = (targetRole) => {
    setIsAuthModalOpen(false);
    if (targetRole === 'ROLE_INSTRUCTOR') {
      setCurrentTab('instructor-dashboard');
    } else if (targetRole === 'ROLE_ADMIN') {
      setCurrentTab('admin-overview');
    } else {
      setCurrentTab('student-explore');
    }
  };

  // Student Navigation Handlers
  const handleStudentNavigate = (tab, filterQuery = '') => {
    if (tab === 'student-explore') {
      const q = typeof filterQuery === 'string' ? filterQuery.trim() : '';
      if (q && q !== 'all') {
        setExploreFilterQuery(q);
        setCurrentTab('student-course-listing');
      } else {
        setExploreFilterQuery('');
        setCurrentTab('student-explore');
      }
      return;
    }
    if (tab === 'student-course-listing') {
      setExploreFilterQuery(typeof filterQuery === 'string' ? filterQuery : '');
    }
    setCurrentTab(tab);
  };

  const handleSelectCourse = (slugOrId) => {
    setActiveCourseSlug(slugOrId);
    setCurrentTab('student-course-detail');
  };

  const handleStartLearning = (courseId) => {
    setActiveCourseId(courseId);
    setCurrentTab('student-learning');
  };

  const handleStartQuiz = (quizId, enrollmentId) => {
    setActiveQuizId(quizId);
    setActiveEnrollmentId(enrollmentId);
    setCurrentTab('student-quiz-intro');
  };

  const handleConfirmStartQuiz = (quizId, enrollmentId) => {
    setActiveQuizId(quizId);
    setActiveEnrollmentId(enrollmentId);
    setCurrentTab('student-quiz-taking');
  };

  const handleCompleteQuiz = (result) => {
    setQuizResultData(result);
    setCurrentTab('student-quiz-result');
  };

  const handleViewCertificate = (certCode) => {
    setInitialCertCode(certCode);
    setCurrentTab('student-certificates');
  };

  // Instructor Navigation Handlers
  const handleEditCourse = (courseId) => {
    setActiveCourseId(courseId);
    setCurrentTab('instructor-course-editor');
  };

  const handleBuildQuiz = (courseId) => {
    setActiveCourseId(courseId);
    setCurrentTab('instructor-quiz-builder');
  };

  // Determine which Role Group is active based on currentTab
  const isInstructorRoute = currentTab.startsWith('instructor-');
  const isAdminRoute = currentTab.startsWith('admin-');
  const isStudentRoute = !isInstructorRoute && !isAdminRoute;

  return (
    <>
      {/* 1. STUDENT WORKSPACE & LAYOUT */}
      {isStudentRoute && (
        <StudentLayout
          currentTab={currentTab}
          onNavigate={handleStudentNavigate}
          onOpenAuthModal={handleOpenAuthModal}
        >
          {currentTab === 'student-explore' && (
            <ExplorePage
              onSelectCourse={handleSelectCourse}
            />
          )}

          {currentTab === 'student-course-listing' && (
            <CourseListingPage
              filterQuery={exploreFilterQuery}
              onSelectCourse={handleSelectCourse}
              onNavigate={handleStudentNavigate}
            />
          )}

          {currentTab === 'student-course-detail' && (
            <CourseDetailPage
              courseSlug={activeCourseSlug}
              onBack={() => setCurrentTab('student-explore')}
              onStartLearning={handleStartLearning}
              onOpenAuthModal={handleOpenAuthModal}
            />
          )}

          {currentTab === 'student-learning' && (
            <CoursePlayerPage
              courseId={activeCourseId}
              onBack={() => setCurrentTab('student-my-learning')}
              onStartQuiz={handleStartQuiz}
              onViewCertificate={handleViewCertificate}
            />
          )}

          {currentTab === 'student-quiz-intro' && (
            <QuizIntroPage
              quizId={activeQuizId}
              enrollmentId={activeEnrollmentId}
              onConfirmStart={handleConfirmStartQuiz}
              onCancel={() => setCurrentTab('student-learning')}
            />
          )}

          {currentTab === 'student-quiz-taking' && (
            <QuizTakingPage
              quizId={activeQuizId}
              enrollmentId={activeEnrollmentId}
              onBack={() => setCurrentTab('student-quiz-intro')}
              onCompleteQuiz={handleCompleteQuiz}
            />
          )}

          {currentTab === 'student-quiz-result' && (
            <QuizResultPage
              result={quizResultData}
              onBackToCourse={() => setCurrentTab('student-learning')}
              onRetryQuiz={() => setCurrentTab('student-quiz-intro')}
              onViewCertificate={handleViewCertificate}
            />
          )}

          {currentTab === 'student-certificates' && (
            <MyCertificatesPage initialCode={initialCertCode} />
          )}

          {currentTab === 'student-my-learning' && (
            <MyLearningPage
              onStartLearning={handleStartLearning}
              onExplore={() => setCurrentTab('student-explore')}
            />
          )}

          {currentTab === 'student-profile' && (
            <StudentProfilePage />
          )}
        </StudentLayout>
      )}

      {/* 2. INSTRUCTOR WORKSPACE & LAYOUT */}
      {isInstructorRoute && (
        <InstructorLayout
          currentTab={currentTab}
          onNavigate={(tab) => setCurrentTab(tab)}
          onCreateCourse={() => {
            setActiveCourseId(null);
            setCurrentTab('instructor-create-course');
          }}
        >
          {currentTab === 'instructor-dashboard' && (
            <InstructorDashboard
              onEditCourse={handleEditCourse}
              onCreateCourse={() => {
                setActiveCourseId(null);
                setCurrentTab('instructor-create-course');
              }}
              onBuildQuiz={handleBuildQuiz}
            />
          )}

          {currentTab === 'instructor-create-course' && (
            <CourseCreateWizardPage
              onBack={() => setCurrentTab('instructor-dashboard')}
              onCourseCreated={(newCourseId) => {
                setActiveCourseId(newCourseId);
                setCurrentTab('instructor-course-editor');
              }}
            />
          )}

          {currentTab === 'instructor-course-editor' && (
            <CourseEditorPage
              courseId={activeCourseId}
              onBack={() => setCurrentTab('instructor-dashboard')}
            />
          )}

          {currentTab === 'instructor-quiz-builder' && (
            <QuizBuilderPage
              courseId={activeCourseId}
              onBack={() => setCurrentTab('instructor-dashboard')}
            />
          )}

          {currentTab === 'instructor-student-progress' && (
            <StudentProgressPage />
          )}

          {currentTab === 'instructor-profile' && (
            <InstructorProfilePage />
          )}
        </InstructorLayout>
      )}

      {/* 3. ADMIN WORKSPACE & LAYOUT */}
      {isAdminRoute && (
        <AdminLayout
          currentTab={currentTab}
          onNavigate={(tab) => setCurrentTab(tab)}
        >
          {currentTab === 'admin-overview' && (
            <AdminOverviewPage
              onNavigateSubTab={(subTab) => {
                if (subTab === 'course-approval') setCurrentTab('admin-course-approval');
                if (subTab === 'user-management') setCurrentTab('admin-user-management');
              }}
            />
          )}

          {currentTab === 'admin-course-approval' && (
            <CourseApprovalPage onBack={() => setCurrentTab('admin-overview')} />
          )}

          {currentTab === 'admin-user-management' && (
            <UserManagementPage onBack={() => setCurrentTab('admin-overview')} />
          )}

          {currentTab === 'admin-profile' && (
            <AdminProfilePage />
          )}
        </AdminLayout>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

