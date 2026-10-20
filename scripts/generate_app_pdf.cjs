const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

// Color definitions
const PRIMARY = [79, 70, 229]; // Indigo
const SECONDARY = [15, 23, 42]; // Slate 900
const MUTED = [100, 116, 139]; // Slate 500
const BORDER = [226, 232, 240]; // Slate 200
const ACCENT = [16, 185, 129]; // Emerald

let y = 18;

function checkPage(needed = 20) {
  if (y + needed > 275) {
    doc.addPage();
    y = 20;
    // Add running header on subsequent pages
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
doc.text('Student Missed Class Recovery & Academic Attendance Planner', 26, y + 17);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(226, 232, 240);
doc.text('Generated: Fall 2026 Term', 145, y + 17);

y += 32;

// === SECTION 1: EXECUTIVE OVERVIEW ===
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
doc.text('1. EXECUTIVE SUMMARY & OBJECTIVES', 20, y);
y += 6;

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
const introText = 
  'The NPP Institute Missed Class Recovery Planner is a collegiate academic application designed ' +
  'to eliminate student course debt resulting from unavoidable lecture or laboratory absences. ' +
  'It converts sudden missed class periods into structured, time-blocked 72-hour recovery dossiers, ' +
  'coordinates peer note sharing, automates professional communication with instructors, and tracks ' +
  'mandatory institutional attendance thresholds to prevent exam debarment.';

const splitIntro = doc.splitTextToSize(introText, 170);
doc.text(splitIntro, 20, y);
y += splitIntro.length * 4.5 + 4;

// === SECTION 2: SYSTEM CAPABILITIES & FEATURES ===
checkPage(30);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
doc.text('2. CORE APPLICATION FEATURES', 20, y);
y += 6;

const features = [
  {
    title: 'A. Automated Absence Triage & Recovery Dossiers',
    desc: 'Generates customized milestone checklists depending on class type (Lecture, Lab practical, Seminar, or Recitation). Automatically factors in slide decks, Panopto recording replays, and problem sets.'
  },
  {
    title: 'B. Mandatory Attendance Risk & Debarment Calculator',
    desc: 'Tracks institutional attendance compliance (75% and 80% thresholds). Features an interactive "What-If" trajectory simulator calculating the exact number of consecutive classes a student must attend to restore compliant standing.'
  },
  {
    title: 'C. Study Sprint Focus Mode (Pomodoro Timer)',
    desc: 'Integrated 15m, 25m, and 45m deep study timers linked directly to recovery tasks. Includes soft Web Audio completion chimes and auto-saving scratchpads for instructor office hour doubts.'
  },
  {
    title: 'D. Professor & TA Communication Suite',
    desc: 'One-click email generator supporting 5 academic scenarios: Medical clinic notice, quiz/lab makeup inquiry, conference conflict, personal emergency, and office hours review. Offers Formal and Concise tone presets.'
  },
  {
    title: 'E. Peer Notes Network & Reciprocal Academic Karma',
    desc: 'Directory of trusted classmates for note sharing, status tracking (requested, received, reviewed), and one-click SMS request generation.'
  },
  {
    title: 'F. University Single Sign-On (SSO) & Demo Personas',
    desc: 'Secure authentication via Google Workspace for Education, .edu credentials, and instant 1-click student personas (Alex Mercer - CS, Jordan Taylor - Pre-Med, Taylor Reed - Economics).'
  }
];

features.forEach((feat) => {
  checkPage(18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.text(feat.title, 20, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  const splitFeat = doc.splitTextToSize(feat.desc, 170);
  doc.text(splitFeat, 20, y);
  y += splitFeat.length * 4 + 3;
});

y += 3;

// === SECTION 3: ENROLLED COURSES & ATTENDANCE AUDIT ===
checkPage(40);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
doc.text('3. ENROLLED COURSE AUDIT & ATTENDANCE METRICS', 20, y);
y += 6;

// Table Header
doc.setFillColor(BORDER[0], BORDER[1], BORDER[2]);
doc.rect(20, y, 170, 7, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
doc.text('Course Code & Title', 22, y + 5);
doc.text('Schedule', 80, y + 5);
doc.text('Attended/Held', 120, y + 5);
doc.text('Rate', 148, y + 5);
doc.text('Status', 168, y + 5);
y += 8;

const sampleCourses = [
  { code: 'CS 201: Data Structures', sched: 'MWF 10:00-11:15 AM', stat: '14 / 16 held', rate: '87.5%', status: 'Safe' },
  { code: 'BIO 110: Cell Biology & Gen', sched: 'TTh 01:30-03:00 PM', stat: '9 / 12 held', rate: '75.0%', status: 'Danger (<80%)' },
  { code: 'MATH 215: Linear Algebra', sched: 'TTh 10:00-11:30 AM', stat: '10 / 11 held', rate: '90.9%', status: 'Safe' },
  { code: 'ECON 102: Macroeconomics', sched: 'MWF 02:00-03:15 PM', stat: '15 / 15 held', rate: '100.0%', status: 'Safe' },
];

sampleCourses.forEach((c) => {
  checkPage(8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.text(c.code, 22, y + 4);
  doc.text(c.sched, 80, y + 4);
  doc.text(c.stat, 120, y + 4);
  doc.text(c.rate, 148, y + 4);

  if (c.status.includes('Danger')) {
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setTextColor(16, 185, 129);
  }
  doc.text(c.status, 168, y + 4);

  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.line(20, y + 6, 190, y + 6);
  y += 7;
});

y += 4;

// === SECTION 4: 72-HOUR RECOVERY PROTOCOL ===
checkPage(35);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
doc.text('4. STANDARD 72-HOUR RECOVERY PROTOCOL', 20, y);
y += 6;

const protocol = [
  { phase: '0 – 12 Hours Post-Absence', text: 'Transmit polite absence notice to instructor or TA. Connect with registered peer note partner to request lecture annotations.' },
  { phase: '12 – 36 Hours Post-Absence', text: 'Stream recorded lecture at 1.25x or review slide deck. Cross-examine peer notes and solve 2 foundational practice problems.' },
  { phase: '36 – 72 Hours (Prior to Next Class)', text: 'Complete homework or lab analysis. Test key concepts with the self-check mastery tool. Formulate 2 questions for upcoming office hours.' }
];

protocol.forEach((p) => {
  checkPage(14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.text(p.phase, 20, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  const splitP = doc.splitTextToSize(p.text, 170);
  doc.text(splitP, 20, y);
  y += splitP.length * 3.8 + 2.5;
});

// === SECTION 5: TECHNICAL ARCHITECTURE & COMPLIANCE ===
checkPage(35);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
doc.text('5. ARCHITECTURE, SECURITY & FERPA COMPLIANCE', 20, y);
y += 6;

const techPoints = [
  '• Client Framework: React 19 SPA running on Vite with TypeScript and Tailwind CSS.',
  '• Security & Auth: Firebase Authentication (Google OAuth + Email/Password) with FERPA-aligned access policies.',
  '• Data Persistence: Google Cloud Firestore with Attribute-Based Access Control (ABAC) rules isolating student records.',
  '• Offline Resilience: Hybrid localStorage synchronization ensuring offline task progress retention.',
  '• Audio & Interactivity: Native Web Audio API synthesis for distraction-free sprint cues.'
];

techPoints.forEach((tp) => {
  checkPage(8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(tp, 20, y);
  y += 5;
});

// === FOOTER ON LAST PAGE ===
y += 8;
checkPage(15);
doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
doc.line(20, y, 190, y);
y += 5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
doc.text('Official Technical & Academic Dossier · NPP Institute Academic Planning Division · Confidential', 20, y);

// Output file
const outputPath = path.resolve(__dirname, '../NPP_Institute_Application_Dossier.pdf');
const pdfBytes = doc.output();
fs.writeFileSync(outputPath, pdfBytes, 'binary');

console.log('PDF generated successfully at:', outputPath);
