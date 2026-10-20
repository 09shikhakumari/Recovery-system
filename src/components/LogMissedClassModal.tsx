import React, { useState } from 'react';
import { Course, MissedClassPlan, PriorityLevel, ClassType, RecoveryTask } from '../types';
import { analyzeCourseAttendance } from '../utils/attendanceCalculators';
import { X, Calendar, AlertTriangle, CheckCircle, BookOpen, User, Flame } from 'lucide-react';

interface LogMissedClassModalProps {
  courses: Course[];
  onClose: () => void;
  onSavePlan: (newPlan: MissedClassPlan, updatedCourse?: Course) => void;
}

export const LogMissedClassModal: React.FC<LogMissedClassModalProps> = ({
  courses,
  onClose,
  onSavePlan,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [missedDate, setMissedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [topicsCovered, setTopicsCovered] = useState<string>('');
  const [classType, setClassType] = useState<ClassType>('lecture');
  const [reason, setReason] = useState<MissedClassPlan['reason']>('illness');
  const [reasonDetails, setReasonDetails] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [hasRecording, setHasRecording] = useState<boolean>(true);
  const [recordingUrl, setRecordingUrl] = useState<string>('');
  const [buddyName, setBuddyName] = useState<string>('');
  const [buddyContact, setBuddyContact] = useState<string>('');
  const [updateAttendanceCount, setUpdateAttendanceCount] = useState<boolean>(true);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const attendanceAnalysis = selectedCourse ? analyzeCourseAttendance(selectedCourse) : null;

  // Project impact if attendance is updated
  const simulatedHeld = selectedCourse ? selectedCourse.attendancePolicy.classesHeld + 1 : 1;
  const simulatedAttended = selectedCourse ? selectedCourse.attendancePolicy.classesAttended : 0;
  const projectedPercentage = simulatedHeld > 0 ? (simulatedAttended / simulatedHeld) * 100 : 100;
  const willDropBelow = selectedCourse && projectedPercentage < selectedCourse.attendancePolicy.minimumPercentage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicsCovered.trim() || !selectedCourse) return;

    // Build smart default tasks based on class type
    const defaultTasks: RecoveryTask[] = [];

    if (classType === 'lab') {
      defaultTasks.push(
        {
          id: `task-${Date.now()}-1`,
          title: 'Request raw lab data and observations from lab partner',
          category: 'peer_notes',
          estimatedMinutes: 20,
          completed: false,
        },
        {
          id: `task-${Date.now()}-2`,
          title: 'Review lab manual theoretical background & procedure',
          category: 'reading',
          estimatedMinutes: 35,
          completed: false,
        },
        {
          id: `task-${Date.now()}-3`,
          title: 'Complete Post-Lab analysis worksheet & calculations',
          category: 'assignment',
          estimatedMinutes: 50,
          completed: false,
        },
        {
          id: `task-${Date.now()}-4`,
          title: 'Email TA or professor regarding makeup lab verification',
          category: 'office_hours',
          estimatedMinutes: 15,
          completed: false,
        }
      );
    } else if (classType === 'seminar') {
      defaultTasks.push(
        {
          id: `task-${Date.now()}-1`,
          title: 'Read assigned discussion papers and annotate 3 talking points',
          category: 'reading',
          estimatedMinutes: 45,
          completed: false,
        },
        {
          id: `task-${Date.now()}-2`,
          title: 'Review peer discussion notes on seminar themes',
          category: 'peer_notes',
          estimatedMinutes: 25,
          completed: false,
        },
        {
          id: `task-${Date.now()}-3`,
          title: 'Submit seminar makeup reflection response to Canvas',
          category: 'assignment',
          estimatedMinutes: 40,
          completed: false,
        }
      );
    } else {
      // Lecture / Recitation default
      defaultTasks.push(
        {
          id: `task-${Date.now()}-1`,
          title: hasRecording ? 'Watch recorded lecture replay at 1.25x' : 'Review posted lecture slides',
          category: 'recording',
          estimatedMinutes: hasRecording ? 50 : 35,
          completed: false,
        },
        {
          id: `task-${Date.now()}-2`,
          title: `Cross-reference lecture slides with ${buddyName || 'peer'} notes`,
          category: 'peer_notes',
          estimatedMinutes: 30,
          completed: false,
        },
        {
          id: `task-${Date.now()}-3`,
          title: 'Solve textbook practice exercises for missed section',
          category: 'reading',
          estimatedMinutes: 40,
          completed: false,
        },
        {
          id: `task-${Date.now()}-4`,
          title: 'Formulate 2 clarification questions for next office hours',
          category: 'office_hours',
          estimatedMinutes: 15,
          completed: false,
        }
      );
    }

    const totalMinutes = defaultTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

    const newPlan: MissedClassPlan = {
      id: `plan-${selectedCourse.code.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`,
      courseId: selectedCourse.id,
      missedDate,
      topicsCovered: topicsCovered.trim(),
      reason,
      reasonDetails: reasonDetails.trim() || undefined,
      priority,
      status: 'triage_needed',
      classType,
      missedMaterials: {
        lectureRecordingAvailable: hasRecording,
        recordingUrl: recordingUrl.trim() || undefined,
      },
      peerNote: {
        buddyName: buddyName.trim() || 'Class Study Buddy',
        buddyContact: buddyContact.trim() || 'Course Discord / GroupMe',
        status: 'not_asked',
      },
      tasks: defaultTasks,
      keyConcepts: [
        {
          id: `kc-${Date.now()}-1`,
          term: topicsCovered.split(':')[0] || 'Core Lecture Topic',
          summary: 'Review key definition, formula, or experiment from this class.',
          mastered: false,
        },
      ],
      professorNotified: false,
      totalEstimatedMinutes: totalMinutes,
      createdAt: new Date().toISOString(),
    };

    let updatedCourse: Course | undefined = undefined;
    if (updateAttendanceCount && selectedCourse) {
      updatedCourse = {
        ...selectedCourse,
        attendancePolicy: {
          ...selectedCourse.attendancePolicy,
          classesHeld: selectedCourse.attendancePolicy.classesHeld + 1,
        },
      };
    }

    onSavePlan(newPlan, updatedCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Log Missed Class</h2>
            <p className="text-xs text-slate-300">
              Generate an actionable recovery roadmap and analyze attendance impact.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Course & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Course *
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Missed Date *
              </label>
              <input
                type="date"
                value={missedDate}
                onChange={(e) => setMissedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Attendance Impact Warning Card */}
          {selectedCourse && attendanceAnalysis && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              willDropBelow
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  {willDropBelow && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>Attendance Policy Impact</span>
                </span>
                <span className="font-mono tabular-nums font-bold">
                  {attendanceAnalysis.currentPercentage.toFixed(1)}% → {projectedPercentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {willDropBelow ? (
                  <span>
                    Warning: Logging this absence brings your attendance below the mandatory{' '}
                    <strong>{selectedCourse.attendancePolicy.minimumPercentage}% threshold</strong>. Consider notifying Prof. {selectedCourse.professor} immediately.
                  </span>
                ) : (
                  <span>
                    Remaining safe absences this semester after this class:{' '}
                    <strong>{Math.max(0, attendanceAnalysis.maxAdditionalAbsencesAllowed - 1)}</strong> skips.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Topic / Subject Covered */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lecture Topic or Concepts Covered *
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 7: Dynamic Programming & Memoization, Problem Set 3"
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Class Type & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Format
              </label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value as ClassType)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="lecture">Standard Lecture</option>
                <option value="lab">Laboratory Session (Crucial)</option>
                <option value="seminar">Seminar / Discussion</option>
                <option value="recitation">Recitation / Problem Solving</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recovery Urgency
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="urgent">Urgent (Midterm soon / Lab due)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="routine">Routine</option>
              </select>
            </div>
          </div>

          {/* Reason for Absence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Absence
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as MissedClassPlan['reason'])}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="illness">Illness / Medical</option>
                <option value="emergency">Family / Personal Emergency</option>
                <option value="interview">Job / Internship Interview</option>
                <option value="mental_health">Mental Health Day</option>
                <option value="athletic">Athletic / Competition</option>
                <option value="other">Other Unavoidable Conflict</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes / Health Clinic Slip
              </label>
              <input
                type="text"
                placeholder="e.g. Visited Student Health Center at 10 AM"
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Peer Coordination & Materials */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Materials & Peer Notes Network
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Classmate / Study Buddy Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya Patel"
                  value={buddyName}
                  onChange={(e) => setBuddyName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Buddy Contact (Email / Discord)
                </label>
                <input
                  type="text"
                  placeholder="e.g. maya@university.edu"
                  value={buddyContact}
                  onChange={(e) => setBuddyContact(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="recordingCheck"
                checked={hasRecording}
                onChange={(e) => setHasRecording(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="recordingCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                Class recording / Panopto replay will be available
              </label>
            </div>

            {hasRecording && (
              <input
                type="url"
                placeholder="Optional recording URL (e.g. https://panopto...)"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Sync Attendance Counter */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              id="syncAttendance"
              checked={updateAttendanceCount}
              onChange={(e) => setUpdateAttendanceCount(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="syncAttendance" className="cursor-pointer">
              Automatically increment "Classes Held" for this course in the Attendance Calculator
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs"
            >
              Generate Recovery Dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
