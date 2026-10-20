import React, { useState } from 'react';
import { Course, MissedClassPlan, PriorityLevel, RecoveryStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  UserCheck, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  CheckSquare,
  AlertCircle
} from 'lucide-react';

interface RecoveryPlansListProps {
  plans: MissedClassPlan[];
  courses: Course[];
  onSelectPlan: (planId: string) => void;
  onOpenLogModal: () => void;
  onUpdatePlanStatus: (planId: string, status: RecoveryStatus) => void;
}

export const RecoveryPlansList: React.FC<RecoveryPlansListProps> = ({
  plans,
  courses,
  onSelectPlan,
  onOpenLogModal,
  onUpdatePlanStatus,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPlans = plans.filter((plan) => {
    if (selectedCourseFilter !== 'all' && plan.courseId !== selectedCourseFilter) {
      return false;
    }
    if (selectedStatusFilter !== 'all' && plan.status !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const course = courses.find((c) => c.id === plan.courseId);
      const matchesTopic = plan.topicsCovered.toLowerCase().includes(q);
      const matchesCourse = course?.code.toLowerCase().includes(q) || course?.name.toLowerCase().includes(q);
      const matchesBuddy = plan.peerNote.buddyName.toLowerCase().includes(q);
      return matchesTopic || matchesCourse || matchesBuddy;
    }
    return true;
  });

  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Missed Class Recovery Plans
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Step-by-step triage, note acquisition, and study catch-up dossiers.
          </p>
        </div>
        <button
          onClick={onOpenLogModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Missed Lecture</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by topic, course code, peer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Course select */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code}
              </option>
            ))}
          </select>

          {/* Status Segmented Control */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'gathering_notes', label: 'Notes Hunt' },
                { id: 'in_study_sprint', label: 'Studying' },
                { id: 'completed', label: 'Recovered' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedStatusFilter(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedStatusFilter === item.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plans List Cards */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-900">No recovery plans match this filter</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or log a newly missed class.
          </p>
          <button
            onClick={() => {
              setSelectedCourseFilter('all');
              setSelectedStatusFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => {
            const course = getCourse(plan.courseId);
            const completedCount = plan.tasks.filter((t) => t.completed).length;
            const totalCount = plan.tasks.length;
            const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
            const remainingMinutes = plan.tasks
              .filter((t) => !t.completed)
              .reduce((acc, t) => acc + t.estimatedMinutes, 0);

            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: course?.colorTheme || '#4f46e5' }}
                      />
                      <span className="font-bold text-slate-900 text-sm">
                        {course?.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">{course?.name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{plan.classType}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {plan.topicsCovered}
                    </h3>
                  </div>

                  {/* Priority & Status Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded capitalize ${
                        plan.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : plan.priority === 'high'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {plan.priority} Priority
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded capitalize ${
                        plan.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : plan.status === 'in_study_sprint'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {plan.status === 'gathering_notes'
                        ? 'Acquiring Notes'
                        : plan.status === 'in_study_sprint'
                        ? 'Study Sprint'
                        : plan.status === 'completed'
                        ? 'Recovered'
                        : 'Triage Needed'}
                    </span>
                  </div>
                </div>

                {/* Task progress and metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <div className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Missed Date</span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {plan.missedDate} ({plan.reason})
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Peer Notes Buddy</span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {plan.peerNote.buddyName} ({plan.peerNote.status})
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Catch-Up Time</span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5 font-mono tabular-nums">
                      {remainingMinutes > 0 ? `${remainingMinutes} mins remaining` : 'Complete'}
                    </div>
                  </div>
                </div>

                {/* Progress bar + Action bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Tasks Complete</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-700">
                        {completedCount} / {totalCount} ({Math.round(progressPercent)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end text-xs font-semibold text-indigo-600 group-hover:text-indigo-800">
                    <span>Open Plan Dossier</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
