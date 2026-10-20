/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, MissedClassPlan, PeerContact, RecoveryStatus } from './types';
import { INITIAL_COURSES, INITIAL_PLANS, INITIAL_PEER_CONTACTS } from './data/initialData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { TopNav, ActiveTab } from './components/TopNav';
import { DashboardOverview } from './components/DashboardOverview';
import { RecoveryPlansList } from './components/RecoveryPlansList';
import { RecoveryPlanDetailModal } from './components/RecoveryPlanDetailModal';
import { LogMissedClassModal } from './components/LogMissedClassModal';
import { AttendanceCalculator } from './components/AttendanceCalculator';
import { ProfessorEmailGenerator } from './components/ProfessorEmailGenerator';
import { StudySprintTimer } from './components/StudySprintTimer';
import { ScheduleView } from './components/ScheduleView';
import { PeerNetworkModal } from './components/PeerNetworkModal';
import { Users, RotateCcw, Flame, ShieldCheck, CheckCircle2, Award, FileDown } from 'lucide-react';
import { downloadApplicationDossierPdf } from './utils/exportPdf';

const STORAGE_KEY_COURSES = 'catchup_courses_v1';
const STORAGE_KEY_PLANS = 'catchup_plans_v1';
const STORAGE_KEY_PEERS = 'catchup_peers_v1';

function MainAppContent() {
  const { studentProfile, loading, isDemoUser, logout } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Persistent States
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COURSES);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [plans, setPlans] = useState<MissedClassPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLANS);
      return saved ? JSON.parse(saved) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  });

  const [peerContacts, setPeerContacts] = useState<PeerContact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PEERS);
      return saved ? JSON.parse(saved) : INITIAL_PEER_CONTACTS;
    } catch {
      return INITIAL_PEER_CONTACTS;
    }
  });

  // Modals & Context States
  const [selectedPlanIdForDetail, setSelectedPlanIdForDetail] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isPeerNetworkOpen, setIsPeerNetworkOpen] = useState<boolean>(false);

  // Cross-tab triggers
  const [sprintTarget, setSprintTarget] = useState<{ planId: string; taskId: string } | null>(null);
  const [emailTargetPlan, setEmailTargetPlan] = useState<MissedClassPlan | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error('Error saving courses', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
    } catch (e) {
      console.error('Error saving plans', e);
    }
  }, [plans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PEERS, JSON.stringify(peerContacts));
    } catch (e) {
      console.error('Error saving peer contacts', e);
    }
  }, [peerContacts]);

  // If user is not logged in, show the login page
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading student session...</span>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return <LoginPage />;
  }

  // Update a recovery plan
  const handleUpdatePlan = (updatedPlan: MissedClassPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
  };

  // Delete a recovery plan
  const handleDeletePlan = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    if (selectedPlanIdForDetail === planId) {
      setSelectedPlanIdForDetail(null);
    }
  };

  // Update a course
  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  // Add a new course
  const handleAddNewCourse = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse]);
  };

  // Save new plan from Log Missed Class modal
  const handleSaveNewPlan = (newPlan: MissedClassPlan, updatedCourse?: Course) => {
    setPlans((prev) => [newPlan, ...prev]);
    if (updatedCourse) {
      handleUpdateCourse(updatedCourse);
    }
    setSelectedPlanIdForDetail(newPlan.id);
  };

  // Update plan status
  const handleUpdatePlanStatus = (planId: string, status: RecoveryStatus) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, status } : p))
    );
  };

  // Mark professor notified
  const handleMarkPlanNotified = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, professorNotified: true } : p))
    );
  };

  // Start study sprint from another component
  const handleStartSprintWithTask = (planId: string, taskId: string) => {
    setSprintTarget({ planId, taskId });
    setSelectedPlanIdForDetail(null);
    setActiveTab('study_sprint');
  };

  // Open email generator with preselected plan
  const handleOpenEmailForPlan = (plan: MissedClassPlan) => {
    setEmailTargetPlan(plan);
    setSelectedPlanIdForDetail(null);
    setActiveTab('email_generator');
  };

  // Reset demo data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all courses, recovery plans, and attendance data to initial semester demo values?')) {
      localStorage.removeItem(STORAGE_KEY_COURSES);
      localStorage.removeItem(STORAGE_KEY_PLANS);
      localStorage.removeItem(STORAGE_KEY_PEERS);
      setCourses(INITIAL_COURSES);
      setPlans(INITIAL_PLANS);
      setPeerContacts(INITIAL_PEER_CONTACTS);
      setSelectedPlanIdForDetail(null);
    }
  };

  const currentDetailPlan = plans.find((p) => p.id === selectedPlanIdForDetail);
  const currentDetailCourse = currentDetailPlan
    ? courses.find((c) => c.id === currentDetailPlan.courseId)
    : null;

  const handleExportPdf = () => {
    downloadApplicationDossierPdf(studentProfile, courses, plans, peerContacts);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Contract (Wordmark, 4-5 single line links, 1 primary action) */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onExportPdf={handleExportPdf}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Modern & Attractive Student Profile Hero Banner */}
        <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-50/60 via-violet-50/20 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Student Identity Section */}
            <div className="flex items-center gap-4">
              {/* Target 2: Student Avatar with stylish ring, active status dot and hover effect */}
              <div className="relative group shrink-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md transition-transform duration-200 group-hover:scale-105">
                  <img
                    src={studentProfile.avatarUrl || '/src/assets/images/student_avatar_1792510906047.jpg'}
                    alt={studentProfile.displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full bg-slate-100 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-sm">
                    {studentProfile.displayName.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                {/* Active Study Status Dot */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs"
                  title="Active Academic Term"
                />
              </div>

              {/* Target 1: Student Name & Badges */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                    {studentProfile.displayName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700">
                    <Award className="w-3 h-3 text-indigo-600" />
                    <span>Dean's List Track</span>
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-semibold text-slate-700">{studentProfile.major}</span>
                  <span aria-hidden="true">·</span>
                  <span>{studentProfile.academicYear}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{studentProfile.studentId}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">{studentProfile.university}</span>
                </div>
              </div>
            </div>

            {/* Quick Student Academic Stats & Actions */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              {/* Study Streak Badge */}
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <div>
                  <span className="font-bold text-amber-900 tabular-nums">7 Day</span>
                  <span className="text-amber-700 ml-1">Study Streak</span>
                </div>
              </div>

              {/* Download Dossier PDF Button */}
              <button
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download PDF Dossier</span>
              </button>

              {/* Peer Network Button */}
              <button
                onClick={() => setIsPeerNetworkOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Peer Network ({peerContacts.length})</span>
              </button>

              {/* Reset Demo Button */}
              <button
                onClick={handleResetDemoData}
                title="Reset all sample data"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <DashboardOverview
              courses={courses}
              plans={plans}
              onSelectPlan={(id) => setSelectedPlanIdForDetail(id)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onStartSprintWithTask={handleStartSprintWithTask}
              onOpenLogModal={() => setIsLogModalOpen(true)}
            />

            {/* Weekly Timetable & Openings */}
            <ScheduleView
              courses={courses}
              plans={plans}
              onStartSprint={() => setActiveTab('study_sprint')}
              onOpenLogModal={() => setIsLogModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Recovery Plans Board */}
        {activeTab === 'recovery_board' && (
          <RecoveryPlansList
            plans={plans}
            courses={courses}
            onSelectPlan={(id) => setSelectedPlanIdForDetail(id)}
            onOpenLogModal={() => setIsLogModalOpen(true)}
            onUpdatePlanStatus={handleUpdatePlanStatus}
          />
        )}

        {/* Tab 3: Attendance Risk & Simulator */}
        {activeTab === 'attendance' && (
          <AttendanceCalculator
            courses={courses}
            onUpdateCourse={handleUpdateCourse}
            onAddNewCourse={handleAddNewCourse}
          />
        )}

        {/* Tab 4: Professor Email Generator */}
        {activeTab === 'email_generator' && (
          <ProfessorEmailGenerator
            courses={courses}
            plans={plans}
            initialPlan={emailTargetPlan}
            onMarkPlanNotified={handleMarkPlanNotified}
          />
        )}

        {/* Tab 5: Study Sprint Focus Timer */}
        {activeTab === 'study_sprint' && (
          <StudySprintTimer
            courses={courses}
            plans={plans}
            initialPlanId={sprintTarget?.planId}
            initialTaskId={sprintTarget?.taskId}
            onUpdatePlan={handleUpdatePlan}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">NPP Institute</span>
            <span>— Student Missed Class Recovery Portal</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-side persistent storage</span>
            <span>·</span>
            <span>Zero academic debt protocol</span>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      {currentDetailPlan && currentDetailCourse && (
        <RecoveryPlanDetailModal
          plan={currentDetailPlan}
          course={currentDetailCourse}
          onClose={() => setSelectedPlanIdForDetail(null)}
          onUpdatePlan={handleUpdatePlan}
          onDeletePlan={handleDeletePlan}
          onStartSprintWithTask={handleStartSprintWithTask}
          onOpenEmailForPlan={handleOpenEmailForPlan}
        />
      )}

      {/* Log Missed Class Wizard Modal */}
      {isLogModalOpen && (
        <LogMissedClassModal
          courses={courses}
          onClose={() => setIsLogModalOpen(false)}
          onSavePlan={handleSaveNewPlan}
        />
      )}

      {/* Peer Network Modal */}
      {isPeerNetworkOpen && (
        <PeerNetworkModal
          courses={courses}
          contacts={peerContacts}
          onClose={() => setIsPeerNetworkOpen(false)}
          onAddContact={(newContact) => setPeerContacts((prev) => [...prev, newContact])}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
