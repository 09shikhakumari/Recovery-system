import React, { useState } from 'react';
import { Course } from '../types';
import { analyzeCourseAttendance } from '../utils/attendanceCalculators';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Sliders, 
  Plus, 
  Minus, 
  Edit3, 
  HelpCircle,
  TrendingUp,
  Percent
} from 'lucide-react';

interface AttendanceCalculatorProps {
  courses: Course[];
  onUpdateCourse: (updatedCourse: Course) => void;
  onAddNewCourse: (newCourse: Course) => void;
}

export const AttendanceCalculator: React.FC<AttendanceCalculatorProps> = ({
  courses,
  onUpdateCourse,
  onAddNewCourse,
}) => {
  const [selectedCourseForSim, setSelectedCourseForSim] = useState<string>(courses[0]?.id || '');
  const [simFutureSkips, setSimFutureSkips] = useState<number>(0);
  const [simFutureAttended, setSimFutureAttended] = useState<number>(0);

  // New course modal state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMinPercent, setNewMinPercent] = useState(75);
  const [newTotalClasses, setNewTotalClasses] = useState(36);
  const [newSchedule, setNewSchedule] = useState('MWF 11:00 AM');

  // Currently selected course for simulator
  const activeSimCourse = courses.find((c) => c.id === selectedCourseForSim) || courses[0];
  const activeSimAnalysis = activeSimCourse ? analyzeCourseAttendance(activeSimCourse) : null;

  // Simulator math
  let simResultPercent = 0;
  if (activeSimCourse) {
    const simHeld = activeSimCourse.attendancePolicy.classesHeld + simFutureSkips + simFutureAttended;
    const simAttended = activeSimCourse.attendancePolicy.classesAttended + simFutureAttended;
    simResultPercent = simHeld > 0 ? (simAttended / simHeld) * 100 : 100;
  }

  // Quick increment/decrement attendance
  const adjustAttendance = (course: Course, deltaAttended: number, deltaHeld: number) => {
    const newAttended = Math.max(0, course.attendancePolicy.classesAttended + deltaAttended);
    const newHeld = Math.max(newAttended, course.attendancePolicy.classesHeld + deltaHeld);
    onUpdateCourse({
      ...course,
      attendancePolicy: {
        ...course.attendancePolicy,
        classesAttended: newAttended,
        classesHeld: newHeld,
      },
    });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      code: newCode.trim(),
      name: newName.trim(),
      professor: newProfessor.trim() || 'Instructor',
      professorEmail: newEmail.trim() || 'instructor@university.edu',
      officeHours: 'By appointment',
      location: 'Academic Hall',
      schedule: newSchedule.trim(),
      daysOfWeek: ['Mon', 'Wed', 'Fri'],
      timeSlot: '11:00 AM',
      attendancePolicy: {
        minimumPercentage: Number(newMinPercent) || 75,
        totalTermClasses: Number(newTotalClasses) || 36,
        classesHeld: 10,
        classesAttended: 10,
        penaltyDescription: 'Standard university attendance policy.',
      },
      colorTheme: '#4f46e5',
    };

    onAddNewCourse(newCourse);
    setShowAddCourse(false);
    setNewCode('');
    setNewName('');
    setNewProfessor('');
    setNewEmail('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Attendance Health & Debarment Risk
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor institutional mandatory attendance thresholds and simulate recovery trajectories.
          </p>
        </div>
        <button
          onClick={() => setShowAddCourse(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Enrolled Course</span>
        </button>
      </div>

      {/* Courses Attendance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((course) => {
          const analysis = analyzeCourseAttendance(course);
          const isCritical = analysis.status === 'critical';
          const isCaution = analysis.status === 'caution';

          return (
            <div
              key={course.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-xs space-y-4 ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isCaution
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: course.colorTheme }}
                    />
                    <span className="font-bold text-slate-900 text-base">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      {course.schedule}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {course.name} · {course.professor}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-2xl font-extrabold font-mono tabular-nums ${
                      isCritical
                        ? 'text-rose-600'
                        : isCaution
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {analysis.currentPercentage.toFixed(1)}%
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">
                    Required: {course.attendancePolicy.minimumPercentage}%
                  </div>
                </div>
              </div>

              {/* Attendance Bar */}
              <div className="space-y-1">
                <div className="relative w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isCritical
                        ? 'bg-rose-500'
                        : isCaution
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, analysis.currentPercentage)}%` }}
                  />
                  {/* Minimum threshold tick mark */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                    style={{ left: `${course.attendancePolicy.minimumPercentage}%` }}
                    title={`Required: ${course.attendancePolicy.minimumPercentage}%`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>0%</span>
                  <span className="font-semibold text-slate-700">
                    {course.attendancePolicy.minimumPercentage}% Threshold
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {/* Metric Breakdown Table */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg text-center text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">Held</div>
                  <div className="font-bold font-mono tabular-nums text-slate-800">
                    {analysis.classesHeld}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Attended</div>
                  <div className="font-bold font-mono tabular-nums text-slate-800">
                    {analysis.classesAttended}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Missed</div>
                  <div className="font-bold font-mono tabular-nums text-rose-600">
                    {analysis.classesMissed}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Total Term</div>
                  <div className="font-bold font-mono tabular-nums text-slate-800">
                    {analysis.totalTermClasses}
                  </div>
                </div>
              </div>

              {/* Status Diagnostic Callout */}
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed ${
                  isCritical
                    ? 'bg-rose-50 border border-rose-200 text-rose-900'
                    : isCaution
                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                }`}
              >
                {isCritical ? (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Debarment Alert:</strong> You are below the {course.attendancePolicy.minimumPercentage}% threshold! You must attend the next{' '}
                      <strong className="underline">{analysis.classesNeededToReachTarget} consecutive classes</strong> without absence to regain good standing.
                    </div>
                  </div>
                ) : isCaution ? (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Borderline Safe:</strong> You have only{' '}
                      <strong>{analysis.maxAdditionalAbsencesAllowed} more absence</strong> before dropping into debarment risk.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Safe Standing:</strong> You can safely miss up to{' '}
                      <strong>{analysis.maxAdditionalAbsencesAllowed} more classes</strong> this term without violating the policy.
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Adjust Attendance Controls (Fix recording errors) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Manual Attendance Correction:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => adjustAttendance(course, -1, 0)}
                    title="Deduct 1 attended class"
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono tabular-nums font-semibold text-slate-800 px-1">
                    {course.attendancePolicy.classesAttended} / {course.attendancePolicy.classesHeld}
                  </span>
                  <button
                    onClick={() => adjustAttendance(course, 1, 0)}
                    title="Add 1 attended class"
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive What-If Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Interactive Attendance Trajectory Simulator</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate how future attendance decisions will impact your official transcript standing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Simulate Course:</span>
            <select
              value={selectedCourseForSim}
              onChange={(e) => {
                setSelectedCourseForSim(e.target.value);
                setSimFutureSkips(0);
                setSimFutureAttended(0);
              }}
              className="text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.attendancePolicy.classesAttended}/{c.attendancePolicy.classesHeld})
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeSimCourse && activeSimAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            {/* Sliders (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Slider 1: Consecutive future attendances */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    If I attend the next <strong className="text-indigo-600">{simFutureAttended}</strong> classes consecutively:
                  </span>
                  <span className="font-mono tabular-nums text-slate-500">
                    +{simFutureAttended} classes
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={activeSimAnalysis.classesRemaining}
                  value={simFutureAttended}
                  onChange={(e) => setSimFutureAttended(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>0 classes</span>
                  <span>{activeSimAnalysis.classesRemaining} remaining in semester</span>
                </div>
              </div>

              {/* Slider 2: Potential future skips */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    If I miss an additional <strong className="text-rose-600">{simFutureSkips}</strong> upcoming classes:
                  </span>
                  <span className="font-mono tabular-nums text-slate-500">
                    +{simFutureSkips} absences
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={simFutureSkips}
                  onChange={(e) => setSimFutureSkips(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>0 missed</span>
                  <span>10 missed</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSimFutureSkips(0);
                    setSimFutureAttended(0);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Reset simulator to current state
                </button>
              </div>
            </div>

            {/* Projection Outcome Card (5 cols) */}
            <div className="lg:col-span-5 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Projected Standing for {activeSimCourse.code}
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-500">Current Rate</div>
                  <div className="text-lg font-bold font-mono text-slate-700 tabular-nums">
                    {activeSimAnalysis.currentPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="text-2xl text-slate-300 font-light">→</div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Simulated Rate</div>
                  <div
                    className={`text-3xl font-extrabold font-mono tabular-nums ${
                      simResultPercent < activeSimCourse.attendancePolicy.minimumPercentage
                        ? 'text-rose-600'
                        : simResultPercent < activeSimCourse.attendancePolicy.minimumPercentage + 5
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {simResultPercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                {simResultPercent >= activeSimCourse.attendancePolicy.minimumPercentage ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Meets the mandatory {activeSimCourse.attendancePolicy.minimumPercentage}% policy threshold.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Danger: Falls below the required {activeSimCourse.attendancePolicy.minimumPercentage}% threshold!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add Enrolled Course</h3>
              <button
                onClick={() => setShowAddCourse(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Code (e.g. CS 301)</label>
                <input
                  type="text"
                  required
                  placeholder="CS 301"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="Operating Systems"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Professor Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Alan Turing"
                    value={newProfessor}
                    onChange={(e) => setNewProfessor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Professor Email</label>
                  <input
                    type="email"
                    placeholder="turing@univ.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum % Required</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newMinPercent}
                    onChange={(e) => setNewMinPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Term Classes</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={newTotalClasses}
                    onChange={(e) => setNewTotalClasses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="px-3 py-2 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
