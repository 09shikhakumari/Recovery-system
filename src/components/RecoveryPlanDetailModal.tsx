import React, { useState } from 'react';
import { Course, MissedClassPlan, RecoveryStatus, RecoveryTask, KeyConcept } from '../types';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  UserCheck, 
  Mail, 
  Play, 
  Plus, 
  Trash2, 
  ExternalLink,
  Flame,
  AlertTriangle,
  HelpCircle,
  FileText
} from 'lucide-react';

interface RecoveryPlanDetailModalProps {
  plan: MissedClassPlan;
  course: Course;
  onClose: () => void;
  onUpdatePlan: (updatedPlan: MissedClassPlan) => void;
  onDeletePlan: (planId: string) => void;
  onStartSprintWithTask: (planId: string, taskId: string) => void;
  onOpenEmailForPlan: (plan: MissedClassPlan) => void;
}

export const RecoveryPlanDetailModal: React.FC<RecoveryPlanDetailModalProps> = ({
  plan,
  course,
  onClose,
  onUpdatePlan,
  onDeletePlan,
  onStartSprintWithTask,
  onOpenEmailForPlan,
}) => {
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [showAddTask, setShowAddTask] = useState(false);

  // New concept state
  const [newConceptTerm, setNewConceptTerm] = useState('');
  const [newConceptSummary, setNewConceptSummary] = useState('');
  const [showAddConcept, setShowAddConcept] = useState(false);

  // Toggle task complete
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = plan.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    // If all tasks are completed, optionally set status to completed
    const allCompleted = updatedTasks.every((t) => t.completed);
    const updatedStatus: RecoveryStatus = allCompleted ? 'completed' : plan.status === 'completed' ? 'in_study_sprint' : plan.status;

    onUpdatePlan({
      ...plan,
      tasks: updatedTasks,
      status: updatedStatus,
    });
  };

  // Add task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: RecoveryTask = {
      id: `task-custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: 'custom',
      estimatedMinutes: Number(newTaskMinutes) || 25,
      completed: false,
    };

    onUpdatePlan({
      ...plan,
      tasks: [...plan.tasks, newTask],
    });

    setNewTaskTitle('');
    setNewTaskMinutes(30);
    setShowAddTask(false);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    onUpdatePlan({
      ...plan,
      tasks: plan.tasks.filter((t) => t.id !== taskId),
    });
  };

  // Toggle concept mastered
  const handleToggleConcept = (conceptId: string) => {
    const updated = plan.keyConcepts.map((c) =>
      c.id === conceptId ? { ...c, mastered: !c.mastered } : c
    );
    onUpdatePlan({
      ...plan,
      keyConcepts: updated,
    });
  };

  // Add concept
  const handleAddConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConceptTerm.trim()) return;

    const newConcept: KeyConcept = {
      id: `concept-${Date.now()}`,
      term: newConceptTerm.trim(),
      summary: newConceptSummary.trim() || 'Core concept tested from lecture.',
      mastered: false,
    };

    onUpdatePlan({
      ...plan,
      keyConcepts: [...plan.keyConcepts, newConcept],
    });

    setNewConceptTerm('');
    setNewConceptSummary('');
    setShowAddConcept(false);
  };

  // Update peer notes status
  const handleUpdatePeerStatus = (status: 'not_asked' | 'requested' | 'received' | 'reviewed') => {
    onUpdatePlan({
      ...plan,
      peerNote: {
        ...plan.peerNote,
        status,
      },
    });
  };

  // Update overall status
  const handleStatusChange = (status: RecoveryStatus) => {
    onUpdatePlan({
      ...plan,
      status,
    });
  };

  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const totalCount = plan.tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const remainingMinutes = plan.tasks
    .filter((t) => !t.completed)
    .reduce((acc, t) => acc + t.estimatedMinutes, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: course.colorTheme }}
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold">{course.code}</span>
                <span aria-hidden="true">·</span>
                <span>{course.name}</span>
                <span aria-hidden="true">·</span>
                <span>Prof. {course.professor}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {plan.topicsCovered}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Dossier Status:</span>
            <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-lg">
              {(
                [
                  { id: 'triage_needed', label: 'Triage' },
                  { id: 'gathering_notes', label: 'Acquiring Notes' },
                  { id: 'in_study_sprint', label: 'Study Sprint' },
                  { id: 'completed', label: 'Recovered' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStatusChange(s.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    plan.status === s.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-slate-600">
              Absence Date: <strong className="text-slate-900">{plan.missedDate}</strong>
            </div>
            <div className="text-slate-600 font-mono tabular-nums">
              Est. Catch-up: <strong>{remainingMinutes}m</strong> remaining
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Catch-Up Checklist Completion</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {completedCount} of {totalCount} tasks completed ({Math.round(progressPercent)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 2-Column Split: Checklist + Peer & Materials */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col (7 cols): Recovery Checklist */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Catch-Up Action Items
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click a task to check it off, or launch a focus study sprint.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Action</span>
                </button>
              </div>

              {/* Add Task Form */}
              {showAddTask && (
                <form
                  onSubmit={handleAddTask}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="text-xs font-semibold text-slate-700">Add New Recovery Task</div>
                  <input
                    type="text"
                    placeholder="e.g. Read textbook pages 120-135, solve question 4"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Est. Minutes:</span>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        step="5"
                        value={newTaskMinutes}
                        onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs bg-white border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddTask(false)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                      >
                        Save Task
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-2">
                {plan.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      task.completed
                        ? 'bg-slate-50/70 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div
                      onClick={() => handleToggleTask(task.id)}
                      className="flex items-start gap-3 flex-1 cursor-pointer"
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                      <div className="space-y-0.5">
                        <div
                          className={`text-xs font-medium leading-relaxed ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.notes && (
                          <div className="text-[11px] text-slate-500 italic">
                            {task.notes}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="text-[11px] text-rose-600 font-medium">
                            Due: {task.dueDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {task.estimatedMinutes}m
                      </span>
                      {!task.completed && (
                        <button
                          onClick={() => onStartSprintWithTask(plan.id, task.id)}
                          title="Launch Study Sprint with this task"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <Flame className="w-4 h-4 text-amber-500" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Concepts / Flashcard Self-Check */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Concept Mastery Self-Check
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify key ideas tested from this lecture before the next exam.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddConcept(!showAddConcept)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Concept</span>
                  </button>
                </div>

                {showAddConcept && (
                  <form
                    onSubmit={handleAddConcept}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <input
                      type="text"
                      placeholder="Concept / Theorem name (e.g. Kahn's Algorithm)"
                      value={newConceptTerm}
                      onChange={(e) => setNewConceptTerm(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      placeholder="Brief core definition or key formula to remember..."
                      value={newConceptSummary}
                      onChange={(e) => setNewConceptSummary(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddConcept(false)}
                        className="px-2.5 py-1 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg"
                      >
                        Save Concept
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {plan.keyConcepts.map((concept) => (
                    <div
                      key={concept.id}
                      onClick={() => handleToggleConcept(concept.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        concept.mastered
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900">
                          {concept.term}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            concept.mastered
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {concept.mastered ? 'Mastered' : 'Needs Review'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {concept.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col (5 cols): Peer Coordination & Course Materials */}
            <div className="lg:col-span-5 space-y-6">
              {/* Peer Note Network Box */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Peer Notes Coordination</span>
                  </h4>
                  <span className="text-[11px] capitalize text-indigo-600 font-semibold">
                    {plan.peerNote.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="text-slate-600">
                    Study Buddy: <strong className="text-slate-900">{plan.peerNote.buddyName}</strong>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    {plan.peerNote.buddyContact}
                  </div>
                  {plan.peerNote.notesUrlOrInfo && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-200/80 text-slate-700 font-mono text-[11px] break-all">
                      {plan.peerNote.notesUrlOrInfo}
                    </div>
                  )}
                  {plan.peerNote.reciprocalHelpNotes && (
                    <div className="text-slate-500 text-[11px] italic">
                      Karma pledge: {plan.peerNote.reciprocalHelpNotes}
                    </div>
                  )}
                </div>

                {/* Status Switcher */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-medium text-slate-500 mb-1.5">
                    Update notes status:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(
                      [
                        { id: 'requested', label: 'Requested' },
                        { id: 'received', label: 'Received' },
                        { id: 'reviewed', label: 'Reviewed' },
                        { id: 'not_asked', label: 'Not Asked' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleUpdatePeerStatus(st.id)}
                        className={`py-1 px-2 rounded text-xs font-medium border transition-colors ${
                          plan.peerNote.status === st.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Materials & Handouts */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Missed Materials & Links</span>
                </h4>

                <div className="text-xs space-y-2">
                  {plan.missedMaterials.recordingUrl && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 block">Lecture Recording</span>
                        <span className="text-slate-500 truncate block text-[11px]">
                          {plan.missedMaterials.recordingUrl}
                        </span>
                      </div>
                      <a
                        href={plan.missedMaterials.recordingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-indigo-600 hover:text-indigo-800 shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {plan.missedMaterials.slidesUrl && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 block">Lecture Slide Deck</span>
                        <span className="text-slate-500 truncate block text-[11px]">
                          {plan.missedMaterials.slidesUrl}
                        </span>
                      </div>
                      <a
                        href={plan.missedMaterials.slidesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-indigo-600 hover:text-indigo-800 shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {plan.missedMaterials.textbookSections && (
                    <div className="text-slate-700">
                      <span className="font-semibold text-slate-900 block">Readings:</span>
                      <span className="text-slate-600">{plan.missedMaterials.textbookSections}</span>
                    </div>
                  )}

                  {plan.missedMaterials.homeworkImpact && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900">
                      <span className="font-semibold block">Deliverable Impact:</span>
                      <span className="text-amber-800 text-[11px]">{plan.missedMaterials.homeworkImpact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professor Action Button */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">
                    Instructor Communication
                  </span>
                  <span className={`text-[11px] font-medium ${plan.professorNotified ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {plan.professorNotified ? 'Notified' : 'Pending'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenEmailForPlan(plan);
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Draft Professor Email for this Class</span>
                </button>
              </div>

              {/* Delete Dossier */}
              <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this recovery plan?')) {
                      onDeletePlan(plan.id);
                      onClose();
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete recovery plan</span>
                </button>
                <span>Logged {new Date(plan.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
