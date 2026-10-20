import { jsPDF } from 'jspdf';
import { Course, MissedClassPlan, PeerContact } from '../types';
import { StudentProfile } from '../context/AuthContext';
import { analyzeCourseAttendance } from './attendanceCalculators';

export function downloadApplicationDossierPdf(
  profile: StudentProfile | null,
  courses: Course[],
  plans: MissedClassPlan[],
  peers: PeerContact[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const PRIMARY = [79, 70, 229]; // Indigo
  const SECONDARY = [15, 23, 42]; // Slate 900
  const MUTED = [100, 116, 139]; // Slate 500
  const BORDER = [226, 232, 240]; // Slate 200

  let y = 18;

  function checkPage(needed = 20) {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text('NPP Institute — Student Recovery & Attendance Dossier', 20, 10);
      doc.line(20, 12, 190, 12);
    }
  }

  // === HEADER ===
  doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.rect(20, y, 170, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('NPP INSTITUTE', 26, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text('Academic Recovery & Attendance Comprehensive Dossier', 26, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 142, y + 17);

  y += 32;

  // === STUDENT PROFILE SUMMARY ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text('1. STUDENT ACADEMIC PROFILE', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);

  const studentName = profile?.displayName || 'Alex Mercer';
  const major = profile?.major || 'Computer Science & Bio Minor';
  const year = profile?.academicYear || 'Junior (Year 3)';
  const studentId = profile?.studentId || '#8492019';
  const university = profile?.university || 'NPP Institute';

  doc.text(`Student: ${studentName}  |  ID: ${studentId}`, 20, y);
  y += 5;
  doc.text(`Institution: ${university}  |  Program: ${major} (${year})`, 20, y);
  y += 8;

  // === SYSTEM OVERVIEW ===
  checkPage(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text('2. APPLICATION OVERVIEW & ARCHITECTURE', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  const overview = 
    'The NPP Institute Missed Class Recovery Planner is a modern, student-centric academic ' +
    'system designed to eliminate course debt caused by sickness, emergencies, interviews, or conflicts. ' +
    'It includes 72-hour recovery milestones, peer note networks, attendance debarment warnings, ' +
    'Pomodoro study sprint focus timers, and professional email generation for college instructors.';
  const splitOverview = doc.splitTextToSize(overview, 170);
  doc.text(splitOverview, 20, y);
  y += splitOverview.length * 4.2 + 6;

  // === ATTENDANCE AUDIT TABLE ===
  checkPage(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text('3. CURRENT COURSE ATTENDANCE AUDIT', 20, y);
  y += 6;

  doc.setFillColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.rect(20, y, 170, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.text('Course', 22, y + 5);
  doc.text('Professor', 75, y + 5);
  doc.text('Attended', 115, y + 5);
  doc.text('Rate', 145, y + 5);
  doc.text('Status', 168, y + 5);
  y += 8;

  courses.forEach((c) => {
    checkPage(8);
    const analysis = analyzeCourseAttendance(c);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    doc.text(c.code, 22, y + 4);
    doc.text(c.professor, 75, y + 4);
    doc.text(`${analysis.classesAttended}/${analysis.classesHeld}`, 115, y + 4);
    doc.text(`${analysis.currentPercentage.toFixed(1)}%`, 145, y + 4);

    if (analysis.status === 'critical') {
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text('Danger', 168, y + 4);
    } else if (analysis.status === 'caution') {
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text('Caution', 168, y + 4);
    } else {
      doc.setTextColor(16, 185, 129);
      doc.text('Safe', 168, y + 4);
    }

    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.line(20, y + 6, 190, y + 6);
    y += 7;
  });

  y += 5;

  // === ACTIVE RECOVERY PLANS ===
  checkPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text(`4. ACTIVE RECOVERY PLANS (${plans.length} TOTAL LOGGED)`, 20, y);
  y += 6;

  plans.forEach((plan, idx) => {
    checkPage(24);
    const crs = courses.find((c) => c.id === plan.courseId);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    doc.text(`${idx + 1}. [${crs?.code || 'Course'}] ${plan.topicsCovered}`, 20, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(`Date Missed: ${plan.missedDate} | Reason: ${plan.reason} | Priority: ${plan.priority} | Status: ${plan.status}`, 22, y);
    y += 4;
    doc.text(`Peer Buddy: ${plan.peerNote.buddyName} (${plan.peerNote.status}) | Est. Catch-up: ${plan.totalEstimatedMinutes} mins`, 22, y);
    y += 5;

    // List top tasks
    plan.tasks.slice(0, 3).forEach((task) => {
      checkPage(6);
      doc.text(`  • [${task.completed ? 'DONE' : 'PENDING'}] ${task.title} (${task.estimatedMinutes}m)`, 24, y);
      y += 4;
    });
    y += 3;
  });

  // === FERPA & TECHNICAL COMPLIANCE ===
  checkPage(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text('5. SECURITY, PRIVACY & COMPLIANCE', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  const compliance = 
    'All academic records, absence reasons, and peer networks in NPP Institute are strictly ' +
    'governed under FERPA privacy standards. Data is protected with Firebase Zero-Trust Attribute-Based ' +
    'Access Control (ABAC) security rules, ensuring only the enrolled student has access to their recovery dossiers.';
  const splitComp = doc.splitTextToSize(compliance, 170);
  doc.text(splitComp, 20, y);
  y += splitComp.length * 4 + 6;

  // Footer
  checkPage(12);
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.line(20, y, 190, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text('NPP Institute Academic Planning System · Official Academic Recovery Report', 20, y);

  // Trigger download in browser
  doc.save('NPP_Institute_Application_Dossier.pdf');
}
