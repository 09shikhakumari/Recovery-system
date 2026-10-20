export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'routine';

export type RecoveryStatus = 'triage_needed' | 'gathering_notes' | 'in_study_sprint' | 'completed';

export type ClassType = 'lecture' | 'lab' | 'seminar' | 'recitation';

export interface RecoveryTask {
  id: string;
  title: string;
  category: 'recording' | 'peer_notes' | 'reading' | 'assignment' | 'office_hours' | 'custom';
  estimatedMinutes: number;
  completed: boolean;
  dueDate?: string;
  notes?: string;
}

export interface KeyConcept {
  id: string;
  term: string;
  summary: string;
  mastered: boolean;
}

export interface PeerNoteInfo {
  buddyName: string;
  buddyContact: string;
  status: 'not_asked' | 'requested' | 'received' | 'reviewed';
  notesUrlOrInfo?: string;
  reciprocalHelpNotes?: string;
}

export interface MissedClassPlan {
  id: string;
  courseId: string;
  missedDate: string; // YYYY-MM-DD
  topicsCovered: string;
  reason: 'illness' | 'emergency' | 'interview' | 'mental_health' | 'athletic' | 'other';
  reasonDetails?: string;
  priority: PriorityLevel;
  status: RecoveryStatus;
  classType: ClassType;
  missedMaterials: {
    lectureRecordingAvailable: boolean;
    recordingUrl?: string;
    slidesUrl?: string;
    textbookSections?: string;
    homeworkImpact?: string;
  };
  peerNote: PeerNoteInfo;
  tasks: RecoveryTask[];
  keyConcepts: KeyConcept[];
  professorNotified: boolean;
  studentNotes?: string;
  totalEstimatedMinutes: number;
  createdAt: string;
}

export interface Course {
  id: string;
  code: string; // e.g. "CS 201"
  name: string; // e.g. "Data Structures & Algorithms"
  professor: string;
  professorEmail: string;
  officeHours: string;
  location: string;
  schedule: string; // e.g. "MWF 10:00 - 11:15 AM"
  daysOfWeek: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[];
  timeSlot: string; // e.g. "10:00 - 11:15 AM"
  attendancePolicy: {
    minimumPercentage: number; // e.g. 75 or 80
    totalTermClasses: number;
    classesHeld: number;
    classesAttended: number;
    penaltyDescription?: string;
  };
  colorTheme: string;
}

export interface PeerContact {
  id: string;
  name: string;
  courseId: string;
  contact: string;
  notesSharedCount: number;
  notesReceivedCount: number;
}
