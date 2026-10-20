import React from 'react';
import { Course, MissedClassPlan } from '../types';
import { Calendar, Clock, AlertTriangle, Flame } from 'lucide-react';

interface ScheduleViewProps {
  courses: Course[];
  plans: MissedClassPlan[];
  onStartSprint: () => void;
  onOpenLogModal: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  courses,
  plans,
  onStartSprint,
  onOpenLogModal,
}) => {
  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Weekly Course Timetable & Recovery Openings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify gaps between lectures to slot 25–45 min catch-up sprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStartSprint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Launch Sprint</span>
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {days.map((day) => {
          const dayCourses = courses.filter((c) => c.daysOfWeek.includes(day));

          return (
            <div
              key={day}
              className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col space-y-3 min-h-[220px]"
            >
              <div className="text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200 flex justify-between items-center">
                <span>{day}</span>
                <span className="text-[11px] font-normal text-slate-400">
                  {dayCourses.length} {dayCourses.length === 1 ? 'class' : 'classes'}
                </span>
              </div>

              {/* Scheduled Classes */}
              <div className="space-y-2 flex-1">
                {dayCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{c.code}</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c.colorTheme }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{c.timeSlot}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">{c.location}</div>
                  </div>
                ))}

                {/* Free Slot Recovery Suggestion */}
                <div
                  onClick={onStartSprint}
                  className="p-2 rounded-lg border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/70 text-indigo-700 text-center cursor-pointer transition-colors"
                >
                  <span className="text-[11px] font-semibold block">+ Study Gap</span>
                  <span className="text-[10px] text-indigo-500">Free time for catch-up</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
