import React, { useState, useEffect, useRef } from 'react';
import { Course, MissedClassPlan, RecoveryTask } from '../types';
import { playChime } from '../utils/audioAlert';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Volume2, 
  VolumeX, 
  FileText, 
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface StudySprintTimerProps {
  courses: Course[];
  plans: MissedClassPlan[];
  initialPlanId?: string | null;
  initialTaskId?: string | null;
  onUpdatePlan: (plan: MissedClassPlan) => void;
}

export const StudySprintTimer: React.FC<StudySprintTimerProps> = ({
  courses,
  plans,
  initialPlanId,
  initialTaskId,
  onUpdatePlan,
}) => {
  const activePlans = plans.filter((p) => p.status !== 'completed');
  const defaultPlan = (initialPlanId && plans.find((p) => p.id === initialPlanId)) || activePlans[0] || plans[0];

  const [selectedPlanId, setSelectedPlanId] = useState<string>(defaultPlan?.id || '');
  const currentPlan = plans.find((p) => p.id === selectedPlanId);
  const currentCourse = currentPlan ? courses.find((c) => c.id === currentPlan.courseId) : null;

  const defaultTask = (initialTaskId && currentPlan?.tasks.find((t) => t.id === initialTaskId)) ||
    currentPlan?.tasks.find((t) => !t.completed) ||
    currentPlan?.tasks[0];

  const [selectedTaskId, setSelectedTaskId] = useState<string>(defaultTask?.id || '');
  const activeTask = currentPlan?.tasks.find((t) => t.id === selectedTaskId);

  // Timer states
  const [sprintDurationMinutes, setSprintDurationMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionNotes, setSessionNotes] = useState<string>(currentPlan?.studentNotes || '');

  const intervalRef = useRef<number | null>(null);

  // Whenever sprintDurationMinutes changes and timer is not running, reset secondsRemaining
  const handleDurationChange = (minutes: number) => {
    setSprintDurationMinutes(minutes);
    if (!isRunning) {
      setSecondsRemaining(minutes * 60);
    }
  };

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (soundEnabled) {
              playChime();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, soundEnabled]);

  const toggleTimer = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(sprintDurationMinutes * 60);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(sprintDurationMinutes * 60);
  };

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Complete current task
  const handleMarkTaskComplete = () => {
    if (!currentPlan || !activeTask) return;
    const updatedTasks = currentPlan.tasks.map((t) =>
      t.id === activeTask.id ? { ...t, completed: true } : t
    );
    const allDone = updatedTasks.every((t) => t.completed);

    const updatedPlan: MissedClassPlan = {
      ...currentPlan,
      tasks: updatedTasks,
      status: allDone ? 'completed' : 'in_study_sprint',
      studentNotes: sessionNotes,
    };
    onUpdatePlan(updatedPlan);

    // Switch to next uncompleted task
    const nextUncompleted = updatedTasks.find((t) => !t.completed);
    if (nextUncompleted) {
      setSelectedTaskId(nextUncompleted.id);
    }
  };

  // Save session notes
  const handleSaveNotes = () => {
    if (!currentPlan) return;
    onUpdatePlan({
      ...currentPlan,
      studentNotes: sessionNotes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Study Sprint Focus Session
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Focused, timed catch-up blocks to eliminate missed lecture debt without overwhelm.
          </p>
        </div>

        {/* Duration Selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {[
            { label: '15m Blitz', min: 15 },
            { label: '25m Pomodoro', min: 25 },
            { label: '45m Deep Study', min: 45 },
          ].map((d) => (
            <button
              key={d.min}
              onClick={() => handleDurationChange(d.min)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                sprintDurationMinutes === d.min
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Timer & Controls */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-6">
          {/* Active Target Banner */}
          <div className="w-full text-left p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-900">
                {currentCourse ? `${currentCourse.code} · ${currentCourse.name}` : 'Select Recovery Dossier'}
              </span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-slate-400 hover:text-slate-700"
                title="Toggle finish chime"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-sm font-bold text-slate-800 truncate">
              {activeTask ? activeTask.title : currentPlan?.topicsCovered || 'No task selected'}
            </div>
          </div>

          {/* Big Digital Clock Display */}
          <div className="py-6">
            <div className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {formattedTime}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-2">
              {isRunning ? 'FOCUS MODE ACTIVE — STAY IN THE ZONE' : secondsRemaining === 0 ? 'SPRINT COMPLETED!' : 'READY TO COMMENCE SPRINT'}
            </div>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`inline-flex items-center gap-2 px-8 py-3 text-base font-bold rounded-xl transition-all shadow-sm ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-white" />
                  <span>Pause Sprint</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>{secondsRemaining === 0 ? 'Restart Sprint' : 'Start Focus Sprint'}</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Mark Task Complete Button */}
          {activeTask && !activeTask.completed && (
            <button
              onClick={handleMarkTaskComplete}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Active Task as Complete</span>
            </button>
          )}

          {/* Active Plan Tasks Mini-Picker */}
          {currentPlan && (
            <div className="w-full text-left pt-4 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tasks for this Missed Class
              </div>
              <div className="space-y-1.5">
                {currentPlan.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      selectedTaskId === task.id
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className={task.completed ? 'line-through text-slate-400 truncate' : 'truncate'}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0 ml-2">
                      {task.estimatedMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Plan Selector & Study Notes Scratchpad */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recovery Plan Selector Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Recovery Dossier
            </h3>
            <select
              value={selectedPlanId}
              onChange={(e) => {
                setSelectedPlanId(e.target.value);
                const p = plans.find((item) => item.id === e.target.value);
                if (p && p.tasks[0]) {
                  setSelectedTaskId(p.tasks[0].id);
                  setSessionNotes(p.studentNotes || '');
                }
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {plans.map((p) => {
                const c = courses.find((item) => item.id === p.courseId);
                return (
                  <option key={p.id} value={p.id}>
                    {c?.code}: {p.topicsCovered.slice(0, 32)} ({p.missedDate})
                  </option>
                );
              })}
            </select>

            {currentPlan && (
              <div className="text-xs text-slate-600 space-y-1 pt-1">
                <div>
                  Peer Note Buddy: <strong className="text-slate-900">{currentPlan.peerNote.buddyName}</strong> ({currentPlan.peerNote.status})
                </div>
                {currentPlan.missedMaterials.textbookSections && (
                  <div>
                    Readings: <span>{currentPlan.missedMaterials.textbookSections}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Session Notes Scratchpad */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Sprint Notes & Question Scratchpad</span>
              </h3>
              <button
                onClick={handleSaveNotes}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Jot down questions or key takeaways to bring to office hours or ask classmates.
            </p>
            <textarea
              rows={8}
              placeholder="e.g. Question on slide 14: Why is DFS cycle detection requiring 3 colors instead of simple boolean visited?..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full p-3 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Auto-saves to plan dossier</span>
              <button
                onClick={handleSaveNotes}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800"
              >
                Update Dossier Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
