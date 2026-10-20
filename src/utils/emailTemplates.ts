import { Course, MissedClassPlan } from '../types';

export type EmailScenario = 
  | 'medical_illness' 
  | 'personal_emergency' 
  | 'interview_conference' 
  | 'makeup_quiz_lab' 
  | 'office_hours_clarification';

export type EmailTone = 'formal' | 'concise' | 'lab_makeup';

export interface EmailDraft {
  subject: string;
  body: string;
}

export function generateProfessorEmail(
  course: Course,
  plan?: MissedClassPlan | null,
  scenario: EmailScenario = 'medical_illness',
  tone: EmailTone = 'formal',
  customDetails?: {
    customDate?: string;
    customTopic?: string;
    hasDoctorNote?: boolean;
    proposedMeetingTimes?: string;
    studentName?: string;
    studentId?: string;
  }
): EmailDraft {
  const dateStr = plan?.missedDate || customDetails?.customDate || new Date().toISOString().split('T')[0];
  const topicStr = plan?.topicsCovered || customDetails?.customTopic || 'the scheduled lecture';
  const studentName = customDetails?.studentName || 'Alex Mercer';
  const studentId = customDetails?.studentId || 'ID #8492019';
  const hasDoctorNote = customDetails?.hasDoctorNote ?? (plan?.reason === 'illness');
  const proposedTimes = customDetails?.proposedMeetingTimes || 'Thursday between 2:00 PM – 4:00 PM or Friday morning';

  let subject = '';
  let body = '';

  if (scenario === 'medical_illness') {
    if (tone === 'concise') {
      subject = `Absence Notice: ${course.code} (${dateStr}) - ${studentName}`;
      body = `Dear ${course.professor},

I am writing to let you know that due to an illness, I was unable to attend today's ${course.code} class (${dateStr}).

I have arranged to review peer lecture notes and am working through the syllabus readings on ${topicStr}. ${hasDoctorNote ? 'I have medical verification documentation from the health clinic should you need it.' : ''}

Please let me know if there are any specific announcements or handouts from today I should review. Thank you for your understanding.

Best regards,
${studentName}
${course.code} | Student ${studentId}`;
    } else {
      subject = `Notice of Absence: ${course.code} - ${studentName} (${dateStr})`;
      body = `Dear ${course.professor},

I hope this email finds you well.

I am writing to respectfully inform you that I was unable to attend class on ${dateStr} for ${course.name} (${course.code}) due to an unexpected illness.

To ensure I do not fall behind, I am reviewing the lecture slides and reading materials for ${topicStr}, and I have connected with a classmate to cross-reference lecture notes. ${hasDoctorNote ? 'I have received documentation from the Student Health Center and can provide a formal medical note upon request.' : ''}

I will be sure to complete all assigned readings prior to our next lecture. If you have a few minutes during your upcoming office hours (${course.officeHours}), I would appreciate the opportunity to verify that my understanding of the material is on track.

Thank you very much for your time, consideration, and guidance.

Sincerely,
${studentName}
${course.code} Student
University ID: ${studentId}`;
    }
  } else if (scenario === 'personal_emergency') {
    subject = `Urgent Absence Notice: ${course.code} - ${studentName} (${dateStr})`;
    body = `Dear ${course.professor},

I am writing to inform you that due to an unforeseen personal family emergency, I was unable to attend our ${course.code} session on ${dateStr}.

I apologize for the sudden absence. I am actively coordinating with a study partner to obtain comprehensive notes on ${topicStr} and am prioritizing the required coursework so I stay synchronized with the syllabus.

I will follow up once I am back on campus. If any immediate assignments or deliverables require submission, please let me know.

Thank you for your patience and understanding during this time.

Respectfully,
${studentName}
${course.code} | ${studentId}`;
  } else if (scenario === 'interview_conference') {
    subject = `Academic Absence Request: ${course.code} on ${dateStr} - ${studentName}`;
    body = `Dear ${course.professor},

I am writing to notify you regarding an unavoidable academic/professional commitment on ${dateStr}. I had to attend a scheduled interview/academic engagement, which conflicted with our ${course.code} lecture on ${topicStr}.

Prior to this absence, I reviewed the syllabus objectives. I am currently studying the slide deck and working through the assigned chapter exercises.

I will ensure all assignments are submitted promptly on or ahead of the deadline. Thank you for supporting students' career and academic development.

Best regards,
${studentName}
${course.code}
Student ${studentId}`;
  } else if (scenario === 'makeup_quiz_lab') {
    subject = `Makeup Inquiry: ${course.code} Lab / In-Class Assessment (${dateStr}) - ${studentName}`;
    body = `Dear ${course.professor},

I hope your week is going well.

Regarding my excused absence from ${course.code} on ${dateStr} covering ${topicStr}, I wanted to inquire about the possibility of arranging a makeup for the in-class assessment / laboratory experiment.

I have reviewed the background theoretical material and pre-lab requirements so I am fully prepared. Would it be possible to complete this during your upcoming office hours, during a TA session, or at another time convenient for you? 

I am available ${proposedTimes}.

Thank you for your time and accommodation.

Warm regards,
${studentName}
${course.code} | ${studentId}`;
  } else {
    // office_hours_clarification
    subject = `Office Hours Question Follow-up: ${course.code} - ${studentName}`;
    body = `Dear ${course.professor},

I hope you are having a productive week.

Following my recent absence on ${dateStr}, I have thoroughly reviewed the course slides and classmate notes on ${topicStr}, and have completed the initial practice exercises.

I encountered a couple of specific conceptual questions regarding this topic that I would love to clarify with you. Would you have 10-15 minutes during your regular office hours (${course.officeHours}), or an alternative window such as ${proposedTimes}?

I have prepared my questions in advance to make the most efficient use of your time.

Thank you very much,
${studentName}
${course.code} | Student ${studentId}`;
  }

  return { subject, body };
}
