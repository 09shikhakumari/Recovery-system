import React, { useState, useEffect } from 'react';
import { Course, MissedClassPlan } from '../types';
import { 
  generateProfessorEmail, 
  EmailScenario, 
  EmailTone, 
  EmailDraft 
} from '../utils/emailTemplates';
import { 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  User, 
  Calendar, 
  FileText,
  Clock
} from 'lucide-react';

interface ProfessorEmailGeneratorProps {
  courses: Course[];
  plans: MissedClassPlan[];
  initialPlan?: MissedClassPlan | null;
  onMarkPlanNotified?: (planId: string) => void;
}

export const ProfessorEmailGenerator: React.FC<ProfessorEmailGeneratorProps> = ({
  courses,
  plans,
  initialPlan,
  onMarkPlanNotified,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialPlan?.courseId || courses[0]?.id || ''
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlan?.id || 'none'
  );
  const [scenario, setScenario] = useState<EmailScenario>(
    initialPlan?.reason === 'interview'
      ? 'interview_conference'
      : initialPlan?.classType === 'lab'
      ? 'makeup_quiz_lab'
      : 'medical_illness'
  );
  const [tone, setTone] = useState<EmailTone>('formal');

  // Custom details
  const [studentName, setStudentName] = useState<string>('Alex Mercer');
  const [studentId, setStudentId] = useState<string>('ID #8492019');
  const [customDate, setCustomDate] = useState<string>(
    initialPlan?.missedDate || new Date().toISOString().split('T')[0]
  );
  const [customTopic, setCustomTopic] = useState<string>(
    initialPlan?.topicsCovered || ''
  );
  const [hasDoctorNote, setHasDoctorNote] = useState<boolean>(
    initialPlan?.reason === 'illness'
  );
  const [proposedTimes, setProposedTimes] = useState<string>(
    'Thursday between 2:00 PM – 4:00 PM or Friday morning'
  );

  // Editable body state
  const [editableSubject, setEditableSubject] = useState<string>('');
  const [editableBody, setEditableBody] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const linkedPlan = plans.find((p) => p.id === selectedPlanId);

  // Sync when initialPlan changes or user selects plan
  useEffect(() => {
    if (initialPlan) {
      setSelectedCourseId(initialPlan.courseId);
      setSelectedPlanId(initialPlan.id);
      setCustomDate(initialPlan.missedDate);
      setCustomTopic(initialPlan.topicsCovered);
      if (initialPlan.reason === 'interview') {
        setScenario('interview_conference');
      } else if (initialPlan.classType === 'lab') {
        setScenario('makeup_quiz_lab');
      } else {
        setScenario('medical_illness');
      }
    }
  }, [initialPlan]);

  // When plan dropdown changes
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    if (planId !== 'none') {
      const p = plans.find((item) => item.id === planId);
      if (p) {
        setSelectedCourseId(p.courseId);
        setCustomDate(p.missedDate);
        setCustomTopic(p.topicsCovered);
        if (p.reason === 'interview') setScenario('interview_conference');
        else if (p.classType === 'lab') setScenario('makeup_quiz_lab');
        else setScenario('medical_illness');
      }
    }
  };

  // Re-generate draft whenever inputs change
  useEffect(() => {
    if (!selectedCourse) return;
    const draft = generateProfessorEmail(
      selectedCourse,
      linkedPlan,
      scenario,
      tone,
      {
        customDate,
        customTopic,
        hasDoctorNote,
        proposedMeetingTimes: proposedTimes,
        studentName,
        studentId,
      }
    );
    setEditableSubject(draft.subject);
    setEditableBody(draft.body);
  }, [
    selectedCourseId,
    selectedPlanId,
    scenario,
    tone,
    customDate,
    customTopic,
    hasDoctorNote,
    proposedTimes,
    studentName,
    studentId,
  ]);

  const handleCopy = () => {
    const fullText = `Subject: ${editableSubject}\n\n${editableBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (linkedPlan && onMarkPlanNotified) {
      onMarkPlanNotified(linkedPlan.id);
    }
  };

  const mailtoHref = selectedCourse
    ? `mailto:${encodeURIComponent(selectedCourse.professorEmail)}?subject=${encodeURIComponent(
        editableSubject
      )}&body=${encodeURIComponent(editableBody)}`
    : '#';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Professor Communication Generator
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Polished, respectful email templates for illness excuses, quiz makeups, and office hour requests.
          </p>
        </div>

        {linkedPlan && (
          <div className="text-xs px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg">
            Linked to: <strong>{linkedPlan.topicsCovered.slice(0, 35)}...</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Configuration Controls */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Email Configuration
          </h2>

          {/* Link to recovery plan if any */}
          {plans.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Autofill from Logged Absence
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => handlePlanSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">-- Custom (No linked plan) --</option>
                {plans.map((p) => {
                  const c = courses.find((item) => item.id === p.courseId);
                  return (
                    <option key={p.id} value={p.id}>
                      {c?.code}: {p.missedDate} ({p.topicsCovered.slice(0, 30)}...)
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Select Course & Professor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course & Instructor *
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.professor} ({c.professorEmail})
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Communication Purpose *
            </label>
            <div className="space-y-1.5">
              {(
                [
                  { id: 'medical_illness', label: 'Illness / Health Clinic Slip' },
                  { id: 'makeup_quiz_lab', label: 'Lab Experiment / Quiz Makeup Request' },
                  { id: 'interview_conference', label: 'Job Interview / Academic Conflict' },
                  { id: 'personal_emergency', label: 'Urgent Family Emergency' },
                  { id: 'office_hours_clarification', label: 'Office Hours Concept Questions' },
                ] as const
              ).map((sc) => (
                <label
                  key={sc.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    scenario === sc.id
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="scenario"
                    checked={scenario === sc.id}
                    onChange={() => setScenario(sc.id)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{sc.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tone & Style
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTone('formal')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  tone === 'formal'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Formal & Thorough
              </button>
              <button
                type="button"
                onClick={() => setTone('concise')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  tone === 'concise'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Concise & Direct
              </button>
            </div>
          </div>

          {/* Context Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Missed Date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Topic / Lecture Subject
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Meiosis & Karyotype Analysis"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {scenario === 'medical_illness' && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-700">
                <input
                  type="checkbox"
                  id="docNoteCheck"
                  checked={hasDoctorNote}
                  onChange={(e) => setHasDoctorNote(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="docNoteCheck" className="cursor-pointer">
                  Mention medical note available from clinic
                </label>
              </div>
            )}

            {(scenario === 'makeup_quiz_lab' || scenario === 'office_hours_clarification') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Proposed Timeslot
                </label>
                <input
                  type="text"
                  value={proposedTimes}
                  onChange={(e) => setProposedTimes(e.target.value)}
                  placeholder="e.g. Thursday 2:00 PM or Friday morning"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Live Email Preview & Actions */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Recipient: <strong className="text-slate-900">{selectedCourse?.professorEmail}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <a
                href={mailtoHref}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Email App</span>
              </a>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Subject Line (Editable)
            </label>
            <input
              type="text"
              value={editableSubject}
              onChange={(e) => setEditableSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Body Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email Body (Editable)
            </label>
            <textarea
              rows={14}
              value={editableBody}
              onChange={(e) => setEditableBody(e.target.value)}
              className="w-full p-3.5 text-xs leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Etiquette Advice */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">College Professor Etiquette Tip:</span>
            <p>
              Always send emails from your official university (.edu) address. Professors appreciate when students state upfront that they have already checked the syllabus and arranged notes with a classmate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
