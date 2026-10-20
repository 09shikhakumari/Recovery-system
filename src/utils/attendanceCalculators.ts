import { Course } from '../types';

export interface AttendanceAnalysis {
  courseId: string;
  code: string;
  name: string;
  classesHeld: number;
  classesAttended: number;
  classesMissed: number;
  classesRemaining: number;
  totalTermClasses: number;
  currentPercentage: number;
  minimumRequired: number;
  status: 'safe' | 'caution' | 'critical';
  maxAdditionalAbsencesAllowed: number;
  classesNeededToReachTarget: number;
  isRecoverable: boolean;
  projectedPerfectPercentage: number;
}

export function analyzeCourseAttendance(course: Course): AttendanceAnalysis {
  const { classesHeld, classesAttended, totalTermClasses, minimumPercentage } = course.attendancePolicy;
  const classesMissed = Math.max(0, classesHeld - classesAttended);
  const classesRemaining = Math.max(0, totalTermClasses - classesHeld);
  
  const currentPercentage = classesHeld > 0 ? (classesAttended / classesHeld) * 100 : 100;
  
  // Status check
  let status: 'safe' | 'caution' | 'critical' = 'safe';
  if (currentPercentage < minimumPercentage) {
    status = 'critical';
  } else if (currentPercentage < minimumPercentage + 6) {
    status = 'caution';
  }

  // Maximum allowable absences over the entire semester:
  // e.g., for 40 classes at 75% minimum, max absences = floor(40 * 0.25) = 10
  const maxTotalAbsencesAllowed = Math.floor(totalTermClasses * ((100 - minimumPercentage) / 100));
  const maxAdditionalAbsencesAllowed = Math.max(0, maxTotalAbsencesAllowed - classesMissed);

  // If below target, how many consecutive classes must they attend?
  let classesNeededToReachTarget = 0;
  let isRecoverable = true;

  if (currentPercentage < minimumPercentage) {
    const M = minimumPercentage / 100;
    // (classesAttended + k) / (classesHeld + k) >= M
    // k * (1 - M) >= M * classesHeld - classesAttended
    const requiredK = Math.ceil((M * classesHeld - classesAttended) / (1 - M));
    classesNeededToReachTarget = Math.max(0, requiredK);

    if (classesHeld + classesNeededToReachTarget > totalTermClasses) {
      isRecoverable = false;
    }
  }

  // If the student attends every single remaining class:
  const projectedPerfectPercentage = totalTermClasses > 0
    ? ((classesAttended + classesRemaining) / totalTermClasses) * 100
    : 100;

  return {
    courseId: course.id,
    code: course.code,
    name: course.name,
    classesHeld,
    classesAttended,
    classesMissed,
    classesRemaining,
    totalTermClasses,
    currentPercentage,
    minimumRequired: minimumPercentage,
    status,
    maxAdditionalAbsencesAllowed,
    classesNeededToReachTarget,
    isRecoverable,
    projectedPerfectPercentage,
  };
}
