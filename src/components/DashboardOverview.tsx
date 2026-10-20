import React from 'react';
import { Course, MissedClassPlan } from '../types';
import { analyzeCourseAttendance } from '../utils/attendanceCalculators';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, Play, BookOpen, UserCheck, Flame } from 'lucide-react';

interface DashboardOverviewProps {
  courses: Course[];
  plans: MissedClassPlan[];
  onSelectPlan: (planId: string) => void;
  onNavigateTab: (tab: 'recovery_board' | 'attendance' | 'email_generator' | 'study_sprint') => void;
  onStartSprintWithTask?: (planId: string, taskId: string) => void;
  onOpenLogModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  courses,
  plans,
  onSelectPlan,
  onNavigateTab,
  onStartSprintWithTask,
  onOpenLogModal,
}) => {
  // Aggregate statistics
  const activePlans = plans.filter((p) => p.status !== 'completed');
  const totalTasks = plans.flatMap((p) => p.tasks);
  const pendingTasks = totalTasks.filter((t) => !t.completed);
  const completedTasks = totalTasks.filter((t) => t.completed);
  
  const totalMinutesRemaining = pendingTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  // Attendance alerts
  const analyses = courses.map((c) => analyzeCourseAttendance(c));
  const criticalCourses = analyses.filter((a) => a.status === 'critical');
  const cautionCourses = analyses.filter((a) => a.status === 'caution');

  // Most urgent plan
  const urgentPlan = activePlans.sort((a, b) => {
    if (a.priority === 'urgent') return -1;
    if (b.priority === 'urgent') return 1;
    return new Date(b.missedDate).getTime() - new Date(a.missedDate).getTime();
  })[0];

  const urgentCourse = urgentPlan ? courses.find((c) => c.id === urgentPlan.courseId) : null;
  const nextPendingTask = urgentPlan?.tasks.find((t) => !t.completed);

  return (
    <div className="space-y-8">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Missed Class Recovery Hub
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <span>Fall Semester 2026</span>
            <span aria-hidden="true">·</span>
            <span>Week 8</span>
            <span aria-hidden="true">·</span>
            <span>{activePlans.length} active recovery {activePlans.length === 1 ? 'dossier' : 'dossiers'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('study_sprint')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <span>Launch Study Sprint</span>
          </button>
          <button
            onClick={onOpenLogModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <span>Log Missed Lecture</span>
          </button>
        </div>
      </div>

      {/* 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Recovery Plans</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {activePlans.length}
            </span>
            <span className="text-xs text-slate-500">
              of {plans.length} total logged
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-1">
            <span className="font-semibold text-slate-900">{plans.filter(p => p.status === 'completed').length}</span>
            <span>classes fully recovered</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Catch-Up Time Remaining</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {Math.round(totalMinutesRemaining / 60 * 10) / 10}
            </span>
            <span className="text-sm font-medium text-slate-600">hrs</span>
          </div>
          <div className="mt-3 text-xs text-slate-600">
            <span className="tabular-nums font-semibold text-slate-900">{pendingTasks.length}</span> actionable study tasks left
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Attendance Risk Level</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${criticalCourses.length > 0 ? 'text-rose-600' : cautionCourses.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {criticalCourses.length > 0 ? `${criticalCourses.length} Danger` : cautionCourses.length > 0 ? `${cautionCourses.length} Warning` : 'Healthy'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
            <span>{criticalCourses.length > 0 ? 'Debarment risk in ' + criticalCourses[0].code : 'All courses compliant'}</span>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Analyze
            </button>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Sprint Progress</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {totalTasks.length > 0 ? Math.round((completedTasks.length / totalTasks.length) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500">
              ({completedTasks.length}/{totalTasks.length})
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all"
              style={{ width: `${totalTasks.length > 0 ? (completedTasks.length / totalTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Active Priority Recovery + Attendance & Schedule Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Priority Catch-Up Spotlight */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Priority Recovery Roadmap
            </h2>
            <button
              onClick={() => onNavigateTab('recovery_board')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all {plans.length} plans
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentPlan && urgentCourse ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="font-semibold text-slate-900">{urgentCourse.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>Missed {urgentPlan.missedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{urgentPlan.reason}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mt-1">
                    {urgentPlan.topicsCovered}
                  </h3>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${
                  urgentPlan.priority === 'urgent'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {urgentPlan.priority} Priority
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <span>Recovery Milestones</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {urgentPlan.tasks.filter((t) => t.completed).length} / {urgentPlan.tasks.length} Done
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        urgentPlan.tasks.length > 0
                          ? (urgentPlan.tasks.filter((t) => t.completed).length / urgentPlan.tasks.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Next Action Item */}
              {nextPendingTask && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Next Action Item
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span className="text-sm font-medium text-slate-900">
                        {nextPendingTask.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
                      ~{nextPendingTask.estimatedMinutes} min
                    </span>
                  </div>
                  {nextPendingTask.notes && (
                    <p className="text-xs text-slate-600 pl-4.5 italic">
                      “{nextPendingTask.notes}”
                    </p>
                  )}
                  <div className="pt-2 flex items-center gap-3">
                    {onStartSprintWithTask && (
                      <button
                        onClick={() => onStartSprintWithTask(urgentPlan.id, nextPendingTask.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>Start 25m Focus Sprint</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectPlan(urgentPlan.id)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Open Full Dossier
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Checklist Teaser */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">Checklist Highlights</div>
                <div className="space-y-1.5">
                  {urgentPlan.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                        )}
                        <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                          {task.title}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono tabular-nums shrink-0 ml-2">
                        {task.estimatedMinutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peer Note status & email action */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Peer Notes: <strong>{urgentPlan.peerNote.buddyName}</strong> ({urgentPlan.peerNote.status})</span>
                </div>
                <button
                  onClick={() => onSelectPlan(urgentPlan.id)}
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Manage recovery steps →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900">All caught up!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active recovery plans pending. If you missed a lecture or lab today, log it to generate your recovery checklist.
              </p>
              <button
                onClick={onOpenLogModal}
                className="mt-4 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Log Missed Lecture
              </button>
            </div>
          )}

          {/* Quick Academic Protocols / Tips for College Students */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Standard 72-Hour Recovery Protocol
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                <div className="font-semibold text-slate-900">Within 12 Hours</div>
                <div className="text-slate-600 mt-1">
                  Send polite notification to professor or TA, and message peer study buddy for shared lecture notes.
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                <div className="font-semibold text-slate-900">Within 36 Hours</div>
                <div className="text-slate-600 mt-1">
                  Read syllabus chapter, cross-examine peer notes with slides, and solve 2 foundational problems.
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                <div className="font-semibold text-slate-900">Before Next Class</div>
                <div className="text-slate-600 mt-1">
                  Take the concept micro-quiz and write down 2 specific doubts for the professor’s office hours.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Attendance Alerts & Enrolled Courses */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Attendance Health
            </h2>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Debarment Simulator
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Critical Warning if any */}
          {criticalCourses.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Attendance Debarment Risk</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                <strong>{criticalCourses[0].code}</strong> is currently at{' '}
                <span className="font-mono tabular-nums font-bold">
                  {criticalCourses[0].currentPercentage.toFixed(1)}%
                </span>{' '}
                (policy threshold is {criticalCourses[0].minimumRequired}%). You must attend the next{' '}
                <strong className="underline">{criticalCourses[0].classesNeededToReachTarget} consecutive classes</strong> to restore compliance!
              </p>
            </div>
          )}

          {/* Course Attendance List */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
            {courses.map((course) => {
              const analysis = analyzeCourseAttendance(course);
              return (
                <div key={course.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: course.colorTheme }}
                        />
                        <span className="font-bold text-sm text-slate-900">
                          {course.code}
                        </span>
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          {course.schedule}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {course.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span
                          className={`text-base font-bold font-mono tabular-nums ${
                            analysis.status === 'critical'
                              ? 'text-rose-600'
                              : analysis.status === 'caution'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {analysis.currentPercentage.toFixed(1)}%
                        </span>
                        <span className="text-[11px] text-slate-400">
                          / {course.attendancePolicy.minimumPercentage}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        {analysis.classesAttended}/{analysis.classesHeld} attended
                      </div>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        analysis.status === 'critical'
                          ? 'bg-rose-500'
                          : analysis.status === 'caution'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, analysis.currentPercentage)}%` }}
                    />
                  </div>

                  {/* Allowed additional absences */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {analysis.classesMissed} missed so far
                    </span>
                    <span className={analysis.maxAdditionalAbsencesAllowed === 0 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                      {analysis.maxAdditionalAbsencesAllowed === 0
                        ? '0 safe skips remaining'
                        : `${analysis.maxAdditionalAbsencesAllowed} more skips allowed`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Communication Box */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Professor Communication
              </h3>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never let an absence go unaddressed. Draft a personalized email with medical slips or quiz makeup requests.
            </p>
            <button
              onClick={() => onNavigateTab('email_generator')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Compose Professor Email Draft</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
