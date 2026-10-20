import React from 'react';
import { Plus, GraduationCap, LogOut, Sparkles, FileDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'overview' | 'recovery_board' | 'attendance' | 'email_generator' | 'study_sprint';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  onExportPdf?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenLogModal,
  onExportPdf,
}) => {
  const { studentProfile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark with modern vibrant styling */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              NPP Institute
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700">
              Fall 2026
            </span>
          </div>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onTabChange('overview')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onTabChange('recovery_board')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'recovery_board'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Recovery Plans
            </button>
            <button
              onClick={() => onTabChange('attendance')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'attendance'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Attendance Risk
            </button>
            <button
              onClick={() => onTabChange('email_generator')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'email_generator'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Email Professor
            </button>
            <button
              onClick={() => onTabChange('study_sprint')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'study_sprint'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Study Sprint
            </button>
          </nav>

          {/* Zone 3: 1 primary action + student account controls */}
          <div className="flex items-center gap-3 shrink-0">
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                title="Download Application Details (PDF)"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl transition-all"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export PDF</span>
              </button>
            )}

            <button
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all whitespace-nowrap shadow-sm shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Log Absence</span>
            </button>

            {/* Logout button */}
            {studentProfile && (
              <button
                onClick={logout}
                title="Sign out of student portal"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {(['overview', 'recovery_board', 'attendance', 'email_generator', 'study_sprint'] as ActiveTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab === 'overview'
                  ? 'Overview'
                  : tab === 'recovery_board'
                  ? 'Recovery'
                  : tab === 'attendance'
                  ? 'Attendance'
                  : tab === 'email_generator'
                  ? 'Email'
                  : 'Sprint'}
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
