import { Period, Subject, Profile, DayOfWeek, ScheduleSlot, SchoolLevel, AfternoonActivity } from '../types';

export const DAYS: { id: DayOfWeek; name: string; shortName: string }[] = [
  { id: 'monday', name: 'Δευτέρα', shortName: 'Δευ' },
  { id: 'tuesday', name: 'Τρίτη', shortName: 'Τρι' },
  { id: 'wednesday', name: 'Τετάρτη', shortName: 'Τετ' },
  { id: 'thursday', name: 'Πέμπτη', shortName: 'Πεμ' },
  { id: 'friday', name: 'Παρασκευή', shortName: 'Παρ' },
  { id: 'saturday', name: 'Σάββατο', shortName: 'Σαβ' },
];

export const PRESET_AFTERNOON_ACTIVITIES: Omit<AfternoonActivity, 'id'>[] = [
  {
    name: 'Στίβος',
    icon: '🏃',
    color: '#ea580c',
    bgLight: '#fff7ed',
    borderColor: '#fdba74',
    days: ['monday', 'wednesday'],
    startTime: '17:30',
    endTime: '19:00',
    location: 'Δημοτικό Στάδιο',
    instructor: 'Προπονητής: κ. Κώστας',
    notes: 'Αθλητική φόρμα, παπούτσια & παγούρι νερό',
  },
  {
    name: 'Αγγλικά (Φροντιστήριο)',
    icon: '🇬🇧',
    color: '#4f46e5',
    bgLight: '#eef2ff',
    borderColor: '#a5b4fc',
    days: ['tuesday', 'thursday'],
    startTime: '16:30',
    endTime: '18:00',
    location: 'Κέντρο Ξένων Γλωσσών',
    instructor: 'κα. Davis',
    notes: 'Coursebook & Activity Book',
  },
  {
    name: 'Κολύμβηση',
    icon: '🏊',
    color: '#0891b2',
    bgLight: '#ecfeff',
    borderColor: '#67e8f9',
    days: ['tuesday', 'thursday'],
    startTime: '18:30',
    endTime: '19:30',
    location: 'Δημοτικό Κολυμβητήριο',
    instructor: 'κα. Μαρία',
    notes: 'Μαγιό, σκουφάκι, γυαλάκια & μπουρνούζι',
  },
  {
    name: 'Μπάσκετ',
    icon: '🏀',
    color: '#f97316',
    bgLight: '#fff7ed',
    borderColor: '#fed7aa',
    days: ['monday', 'wednesday', 'friday'],
    startTime: '16:00',
    endTime: '17:15',
    location: 'Κλειστό Γυμναστήριο',
    instructor: 'κ. Γιάννης',
  },
  {
    name: 'Ποδόσφαιρο / Ακαδημία',
    icon: '⚽',
    color: '#16a34a',
    bgLight: '#f0fdf4',
    borderColor: '#86efac',
    days: ['tuesday', 'thursday'],
    startTime: '17:00',
    endTime: '18:30',
    location: 'Γήπεδο 5x5',
  },
  {
    name: 'Μουσική / Πιάνο / Κιθάρα',
    icon: '🎹',
    color: '#9333ea',
    bgLight: '#faf5ff',
    borderColor: '#d8b4fe',
    days: ['friday'],
    startTime: '16:00',
    endTime: '17:00',
    location: 'Δημοτικό Ωδείο',
    instructor: 'κα. Ελένη',
  },
  {
    name: 'Ρομποτική & STEM',
    icon: '🤖',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#7dd3fc',
    days: ['saturday'],
    startTime: '10:30',
    endTime: '12:30',
    location: 'Εργαστήριο Ρομποτικής',
    instructor: 'κ. Αλέξανδρος',
  },
  {
    name: 'Πολεμικές Τέχνες (Tae Kwon Do / Judo)',
    icon: '🥋',
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fca5a5',
    days: ['monday', 'wednesday'],
    startTime: '19:00',
    endTime: '20:15',
    location: 'Σχολή Πολεμικών Τεχνών',
  },
  {
    name: 'Χορός / Μπαλέτο',
    icon: '🩰',
    color: '#db2777',
    bgLight: '#fdf2f8',
    borderColor: '#f472b6',
    days: ['tuesday', 'thursday'],
    startTime: '17:15',
    endTime: '18:30',
    location: 'Σχολή Χορού',
  },
  {
    name: 'Μελέτη & Ενισχυτική Διδασκαλία',
    icon: '📚',
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '15:00',
    endTime: '17:00',
    location: 'Κέντρο Μελέτης',
  },
  {
    name: 'Σκάκι',
    icon: '♟️',
    color: '#475569',
    bgLight: '#f8fafc',
    borderColor: '#cbd5e1',
    days: ['saturday'],
    startTime: '11:00',
    endTime: '12:30',
    location: 'Σκακιστικός Όμιλος',
  },
];

export const COLOR_PALETTE = [
  { name: 'Μπλε', hex: '#3b82f6', bgLight: '#eff6ff', border: '#93c5fd' },
  { name: 'Σμαραγδί', hex: '#10b981', bgLight: '#ecfdf5', border: '#6ee7b7' },
  { name: 'Κεχριμπάρι', hex: '#f59e0b', bgLight: '#fffbeb', border: '#fcd34d' },
  { name: 'Μωβ', hex: '#8b5cf6', bgLight: '#f5f3ff', border: '#c4b5fd' },
  { name: 'Κυανό', hex: '#06b6d4', bgLight: '#ecfeff', border: '#67e8f9' },
  { name: 'Ροζ', hex: '#ec4899', bgLight: '#fdf2f8', border: '#f472b6' },
  { name: 'Πορτοκαλί', hex: '#f97316', bgLight: '#fff7ed', border: '#fdba74' },
  { name: 'Indigo', hex: '#6366f1', bgLight: '#eef2ff', border: '#a5b4fc' },
  { name: 'Lime', hex: '#84cc16', bgLight: '#f7fee7', border: '#bef264' },
  { name: 'Βιολετί', hex: '#d946ef', bgLight: '#fdf4ff', border: '#f0abfc' },
  { name: 'Τυρκουάζ', hex: '#14b8a6', bgLight: '#f0fdfa', border: '#5eead4' },
  { name: 'Κόκκινο / Ρουμπινί', hex: '#f43f5e', bgLight: '#fff1f2', border: '#fda4af' },
  { name: 'Γκρι / Slate', hex: '#64748b', bgLight: '#f8fafc', border: '#cbd5e1' },
];

export interface KindergartenRoutineBlock {
  time: string;
  icon: string;
  title: string;
  desc: string;
  isAllDayOnly?: boolean;
}

export const KINDERGARTEN_ROUTINE: KindergartenRoutineBlock[] = [
  { time: '08:15 – 09:00', icon: '🧸', title: 'Υποδοχή & Ελεύθερο Παιχνίδι', desc: 'Προσέλευση παιδιών, γωνιές παιχνιδιού, επιτραπέζια, κατασκευές' },
  { time: '09:00 – 10:15', icon: '⭕', title: 'Πρωινή Παρεούλα & Εργαστήρια Δεξιοτήτων', desc: 'Ημερολόγιο, συζήτηση, καιρός, ομαδικές δραστηριότητες, projects' },
  { time: '10:15 – 10:45', icon: '🥪', title: 'Πρόγευμα (Δεκατιανό) & Αυλή', desc: 'Κολατσιό, προσωπική υγιεινή, ελεύθερο κινητικό παιχνίδι στην αυλή' },
  { time: '10:45 – 12:10', icon: '🎨', title: 'Οργανωμένες Δραστηριότητες & Τέχνες', desc: 'Εικαστικά, χειροτεχνίες, θεατρικό παιχνίδι, μουσικοκινητική & παραμύθι' },
  { time: '12:10 – 13:00', icon: '🎒', title: 'Κλείσιμο Ημέρας & Αποχώρηση Βασικού', desc: 'Ανατροφοδότηση, οργάνωση τσάντας, αποχώρηση κανονικού ωραρίου (13:00)' },
  { time: '13:00 – 14:00', icon: '🍲', title: 'Μεσημεριανό Γεύμα (Ολοήμερο)', desc: 'Σίτιση, αυτόνομη φροντίδα, χαλάρωση', isAllDayOnly: true },
  { time: '14:00 – 15:20', icon: '💤', title: 'Ξεκούραση & Ήσυχο Παιχνίδι', desc: 'Ύπνος / χαλάρωση, ακρόαση μουσικής / παραμυθιού', isAllDayOnly: true },
  { time: '15:20 – 16:00', icon: '🌟', title: 'Απογευματινές Δημιουργικές Δράσεις & Αποχώρηση', desc: 'Παιχνίδι, οργάνωση, αποχώρηση ολοημέρου (16:00)', isAllDayOnly: true },
];

export const KINDERGARTEN_PERIODS: Period[] = [
  { id: 1, label: 'Υποδοχή & Παιχνίδι', startTime: '08:15', endTime: '09:00' },
  { id: 2, label: 'Πρωινή Παρεούλα', startTime: '09:00', endTime: '10:15' },
  { id: 3, label: 'Δεκατιανό & Αυλή', startTime: '10:15', endTime: '10:45' },
  { id: 4, label: 'Εικαστικά & Δράσεις', startTime: '10:45', endTime: '12:10' },
  { id: 5, label: 'Αποχώρηση Βασικού', startTime: '12:10', endTime: '13:00' },
  { id: 6, label: 'Ολοήμερο / Γεύμα & Ύπνος', startTime: '13:00', endTime: '16:00' },
];

export const KINDERGARTEN_SUBJECTS: Subject[] = [
  { id: 'kin-pareoula', name: 'Πρωινή Παρεούλα & Συζήτηση', code: 'ΠΑΡ', color: '#f59e0b', bgLight: '#fffbeb', borderColor: '#fcd34d', icon: '⭕' },
  { id: 'kin-texnes', name: 'Εικαστικά & Χειροτεχνία', code: 'ΤΕΧ', color: '#ec4899', bgLight: '#fdf2f8', borderColor: '#f472b6', icon: '🎨' },
  { id: 'kin-paramythi', name: 'Παραμύθι & Φιλαναγνωσία', code: 'ΒΙΒ', color: '#8b5cf6', bgLight: '#f5f3ff', borderColor: '#c4b5fd', icon: '📚' },
  { id: 'kin-mousiki', name: 'Μουσικοκινητική & Ρυθμός', code: 'ΜΟΥ', color: '#10b981', bgLight: '#ecfdf5', borderColor: '#6ee7b7', icon: '🎵' },
  { id: 'kin-paixnidi', name: 'Ελεύθερο & Ομαδικό Παιχνίδι', code: 'ΠΑΙ', color: '#06b6d4', bgLight: '#ecfeff', borderColor: '#67e8f9', icon: '🧸' },
  { id: 'kin-deksiotites', name: 'Εργαστήρια Δεξιοτήτων', code: 'ΔΕΞ', color: '#3b82f6', bgLight: '#eff6ff', borderColor: '#93c5fd', icon: '🌱' },
];

export interface DeparturePresetOption {
  time: string;
  label: string;
  desc: string;
}

export const DEPARTURE_PRESETS: Record<SchoolLevel, DeparturePresetOption[]> = {
  kindergarten: [
    { time: '13:00', label: '13:00', desc: 'Βασικό Πρόγραμμα' },
    { time: '16:00', label: '16:00', desc: 'Ολοήμερο' },
    { time: '17:30', label: '17:30', desc: 'Αναβαθμισμένο / Διευρυμένο' },
  ],
  primary: [
    { time: '13:15', label: '13:15', desc: 'Κανονικό (6ωρο)' },
    { time: '14:55', label: '14:55', desc: 'Ολοήμερο (1η Ζώνη)' },
    { time: '16:00', label: '16:00', desc: 'Ολοήμερο (2η Ζώνη)' },
    { time: '17:30', label: '17:30', desc: 'Αναβαθμισμένο Ολοήμερο' },
  ],
  gymnasium: [
    { time: '13:30', label: '13:30', desc: '6ωρο Πρόγραμμα' },
    { time: '14:10', label: '14:10', desc: '7ωρο Πρόγραμμα' },
  ],
  lyceum: [
    { time: '13:30', label: '13:30', desc: '6ωρο Πρόγραμμα' },
    { time: '14:10', label: '14:10', desc: '7ωρο Πρόγραμμα' },
  ],
  custom: [
    { time: '13:15', label: '13:15', desc: 'Κανονικό' },
    { time: '14:10', label: '14:10', desc: '7ωρο' },
    { time: '16:00', label: '16:00', desc: 'Ολοήμερο' },
  ],
};

export const CLASS_PRESETS: Record<SchoolLevel, { id: string; label: string }[]> = {
  kindergarten: [
    { id: 'Προνήπιο', label: 'Προνήπιο (4-5 ετών)' },
    { id: 'Νήπιο', label: 'Νήπιο (5-6 ετών)' },
    { id: 'Ενιαίο Τμήμα', label: 'Ενιαίο Τμήμα Νηπίων' },
  ],
  primary: [
    { id: "Α' Δημοτικού", label: "Α' Δημοτικού" },
    { id: "Β' Δημοτικού", label: "Β' Δημοτικού" },
    { id: "Γ' Δημοτικού", label: "Γ' Δημοτικού" },
    { id: "Δ' Δημοτικού", label: "Δ' Δημοτικού" },
    { id: "Ε' Δημοτικού", label: "Ε' Δημοτικού" },
    { id: "ΣΤ' Δημοτικού", label: "ΣΤ' Δημοτικού" },
  ],
  gymnasium: [
    { id: "Α' Γυμνασίου", label: "Α' Γυμνασίου" },
    { id: "Β' Γυμνασίου", label: "Β' Γυμνασίου" },
    { id: "Γ' Γυμνασίου", label: "Γ' Γυμνασίου" },
  ],
  lyceum: [
    { id: "Α' Λυκείου", label: "Α' Λυκείου" },
    { id: "Β' Λυκείου", label: "Β' Λυκείου" },
    { id: "Γ' Λυκείου", label: "Γ' Λυκείου" },
  ],
  custom: [
    { id: 'Τμήμα 1', label: 'Προσαρμοσμένο' },
  ],
};

export const PRIMARY_PERIODS: Period[] = [
  { id: 1, label: '1η Ώρα', startTime: '08:15', endTime: '09:00', breakAfterMinutes: 10 },
  { id: 2, label: '2η Ώρα', startTime: '09:00', endTime: '09:40', breakAfterMinutes: 20 },
  { id: 3, label: '3η Ώρα', startTime: '10:00', endTime: '10:45', breakAfterMinutes: 10 },
  { id: 4, label: '4η Ώρα', startTime: '10:45', endTime: '11:30', breakAfterMinutes: 15 },
  { id: 5, label: '5η Ώρα', startTime: '11:45', endTime: '12:25', breakAfterMinutes: 10 },
  { id: 6, label: '6η Ώρα', startTime: '12:35', endTime: '13:15', breakAfterMinutes: 5 },
  // Ολοήμερο Πρόγραμμα Δημοτικού
  { id: 7, label: '7η Ώρα (Σίτιση)', startTime: '13:20', endTime: '14:00', breakAfterMinutes: 15, isAllDay: true },
  { id: 8, label: '8η Ώρα (Μελέτη)', startTime: '14:15', endTime: '15:00', breakAfterMinutes: 15, isAllDay: true },
  { id: 9, label: '9η Ώρα (Δράσεις)', startTime: '15:15', endTime: '16:00', breakAfterMinutes: 15, isAllDay: true },
  { id: 10, label: '10η Ώρα (Όμιλοι)', startTime: '16:15', endTime: '17:30', breakAfterMinutes: 0, isAllDay: true },
];

export const PRIMARY_ALL_DAY_PERIODS: Period[] = PRIMARY_PERIODS.filter((p) => p.isAllDay);

export const GYMNASIUM_PERIODS: Period[] = [
  { id: 1, label: '1η Ώρα', startTime: '08:15', endTime: '09:00', breakAfterMinutes: 5 },
  { id: 2, label: '2η Ώρα', startTime: '09:05', endTime: '09:50', breakAfterMinutes: 10 },
  { id: 3, label: '3η Ώρα', startTime: '10:00', endTime: '10:45', breakAfterMinutes: 10 },
  { id: 4, label: '4η Ώρα', startTime: '10:55', endTime: '11:40', breakAfterMinutes: 10 },
  { id: 5, label: '5η Ώρα', startTime: '11:50', endTime: '12:35', breakAfterMinutes: 10 },
  { id: 6, label: '6η Ώρα', startTime: '12:45', endTime: '13:30', breakAfterMinutes: 5 },
  { id: 7, label: '7η Ώρα', startTime: '13:35', endTime: '14:10' },
];

export const LYCEUM_PERIODS: Period[] = [
  { id: 1, label: '1η Ώρα', startTime: '08:15', endTime: '09:00', breakAfterMinutes: 5 },
  { id: 2, label: '2η Ώρα', startTime: '09:05', endTime: '09:50', breakAfterMinutes: 10 },
  { id: 3, label: '3η Ώρα', startTime: '10:00', endTime: '10:45', breakAfterMinutes: 10 },
  { id: 4, label: '4η Ώρα', startTime: '10:55', endTime: '11:40', breakAfterMinutes: 10 },
  { id: 5, label: '5η Ώρα', startTime: '11:50', endTime: '12:35', breakAfterMinutes: 10 },
  { id: 6, label: '6η Ώρα', startTime: '12:45', endTime: '13:30', breakAfterMinutes: 5 },
  { id: 7, label: '7η Ώρα', startTime: '13:35', endTime: '14:10' },
];

export const PRIMARY_SUBJECTS: Subject[] = [
  { id: 'pri-glossa', name: 'Γλώσσα', code: 'ΓΛΩ', color: '#3b82f6', bgLight: '#eff6ff', borderColor: '#93c5fd', icon: '📖', defaultTeacher: 'κα. Ελένη', defaultRoom: 'Τάξη Α1' },
  { id: 'pri-math', name: 'Μαθηματικά', code: 'ΜΑΘ', color: '#10b981', bgLight: '#ecfdf5', borderColor: '#6ee7b7', icon: '📐', defaultTeacher: 'κα. Ελένη', defaultRoom: 'Τάξη Α1' },
  { id: 'pri-istoria', name: 'Ιστορία', code: 'ΙΣΤ', color: '#f59e0b', bgLight: '#fffbeb', borderColor: '#fcd34d', icon: '🏛️', defaultTeacher: 'κα. Ελένη' },
  { id: 'pri-meleti', name: 'Μελέτη Περιβάλλοντος', code: 'ΜΕΛ', color: '#84cc16', bgLight: '#f7fee7', borderColor: '#bef264', icon: '🌱' },
  { id: 'pri-fysika', name: 'Φυσικά', code: 'ΦΥΣ', color: '#06b6d4', bgLight: '#ecfeff', borderColor: '#67e8f9', icon: '🔬' },
  { id: 'pri-english', name: 'Αγγλικά', code: 'ΑΓΓ', color: '#6366f1', bgLight: '#eef2ff', borderColor: '#a5b4fc', icon: '🇬🇧', defaultTeacher: 'κος Smith' },
  { id: 'pri-french', name: 'Γαλλικά / Γερμανικά', code: 'ΓΑΛ', color: '#8b5cf6', bgLight: '#f5f3ff', borderColor: '#c4b5fd', icon: '🌍' },
  { id: 'pri-tpe', name: 'Πληροφορική (ΤΠΕ)', code: 'ΤΠΕ', color: '#0284c7', bgLight: '#f0f9ff', borderColor: '#7dd3fc', icon: '💻', defaultRoom: 'Εργαστήριο Η/Υ' },
  { id: 'pri-gym', name: 'Φυσική Αγωγή (Γυμναστική)', code: 'ΓΥΜ', color: '#ec4899', bgLight: '#fdf2f8', borderColor: '#f472b6', icon: '⚽', defaultRoom: 'Γήπεδο' },
  { id: 'pri-art', name: 'Εικαστικά', code: 'ΕΙΚ', color: '#f97316', bgLight: '#fff7ed', borderColor: '#fdba74', icon: '🎨' },
  { id: 'pri-music', name: 'Μουσική', code: 'ΜΟΥ', color: '#d946ef', bgLight: '#fdf4ff', borderColor: '#f0abfc', icon: '🎵', defaultRoom: 'Αίθουσα Μουσικής' },
  { id: 'pri-theatre', name: 'Θεατρική Αγωγή', code: 'ΘΕΑ', color: '#14b8a6', bgLight: '#f0fdfa', borderColor: '#5eead4', icon: '🎭' },
  { id: 'pri-relig', name: 'Θρησκευτικά', code: 'ΘΡΗ', color: '#64748b', bgLight: '#f8fafc', borderColor: '#cbd5e1', icon: '🕊️' },
  // Ολοήμερο Subjects
  { id: 'pri-sitisi', name: 'Σίτιση / Γεύμα (Ολοήμερο)', code: 'ΣΙΤ', color: '#f59e0b', bgLight: '#fffbeb', borderColor: '#fcd34d', icon: '🍲', defaultRoom: 'Τραπεζαρία' },
  { id: 'pri-meleti-olohmero', name: 'Μελέτη - Προετοιμασία (Ολοήμερο)', code: 'ΜΕΛ-ΟΛ', color: '#10b981', bgLight: '#ecfdf5', borderColor: '#6ee7b7', icon: '📚', defaultRoom: 'Αίθουσα Μελέτης' },
  { id: 'pri-draseis-olohmero', name: 'Δραστηριότητες Ολοημέρου', code: 'ΔΡΑΣ', color: '#8b5cf6', bgLight: '#f5f3ff', borderColor: '#c4b5fd', icon: '🎨' },
  { id: 'pri-omiloi', name: 'Μαθητικοί Όμιλοι (Διευρυμένο)', code: 'ΟΜΙΛ', color: '#06b6d4', bgLight: '#ecfeff', borderColor: '#67e8f9', icon: '🌟' },
  // Activities
  { id: 'act-stivos', name: 'Στίβος', code: 'ΣΤΙΒ', color: '#ea580c', bgLight: '#fff7ed', borderColor: '#fdba74', icon: '🏃', defaultRoom: 'Δημοτικό Στάδιο' },
  { id: 'act-agg-front', name: 'Αγγλικά (Φροντιστήριο)', code: 'ΑΓΓ-Φ', color: '#4f46e5', bgLight: '#eef2ff', borderColor: '#a5b4fc', icon: '🇬🇧', defaultRoom: 'Κέντρο Ξένων Γλωσσών' },
  { id: 'act-swim', name: 'Κολύμβηση', code: 'ΚΟΛ', color: '#0891b2', bgLight: '#ecfeff', borderColor: '#67e8f9', icon: '🏊', defaultRoom: 'Κολυμβητήριο' },
  { id: 'act-basket', name: 'Μπάσκετ', code: 'ΜΠΑΣ', color: '#f97316', bgLight: '#fff7ed', borderColor: '#fed7aa', icon: '🏀', defaultRoom: 'Κλειστό Γυμναστήριο' },
  { id: 'act-piano', name: 'Μουσική / Πιάνο', code: 'ΜΟΥΣ', color: '#9333ea', bgLight: '#faf5ff', borderColor: '#d8b4fe', icon: '🎹', defaultRoom: 'Ωδείο' },
  { id: 'act-robotics', name: 'Ρομποτική & STEM', code: 'ΡΟΜΠ', color: '#0284c7', bgLight: '#f0f9ff', borderColor: '#7dd3fc', icon: '🤖', defaultRoom: 'Εργαστήριο STEM' },
  { id: 'act-taekwondo', name: 'Tae Kwon Do / Πολεμικές Τέχνες', code: 'TKD', color: '#dc2626', bgLight: '#fef2f2', borderColor: '#fca5a5', icon: '🥋', defaultRoom: 'Dojo' },
];

export const GYMNASIUM_SUBJECTS: Subject[] = [
  { id: 'gym-glossa', name: 'Νεοελληνική Γλώσσα', code: 'ΓΛΩ', color: '#3b82f6', bgLight: '#eff6ff', borderColor: '#93c5fd', icon: '📖', defaultTeacher: 'κα. Γεωργίου', defaultRoom: 'Αίθουσα 14' },
  { id: 'gym-arxaia', name: 'Αρχαία Ελληνικά', code: 'ΑΡΧ', color: '#f59e0b', bgLight: '#fffbeb', borderColor: '#fcd34d', icon: '🏛️', defaultTeacher: 'κα. Γεωργίου', defaultRoom: 'Αίθουσα 14' },
  { id: 'gym-math', name: 'Μαθηματικά (Άλγεβρα/Γεωμ.)', code: 'ΜΑΘ', color: '#10b981', bgLight: '#ecfdf5', borderColor: '#6ee7b7', icon: '📐', defaultTeacher: 'κος Παπαδόπουλος', defaultRoom: 'Αίθουσα 14' },
  { id: 'gym-istoria', name: 'Ιστορία', code: 'ΙΣΤ', color: '#ea580c', bgLight: '#fff7ed', borderColor: '#fdba74', icon: '📜', defaultTeacher: 'κα. Γεωργίου' },
  { id: 'gym-fysiki', name: 'Φυσική', code: 'ΦΥΣ', color: '#06b6d4', bgLight: '#ecfeff', borderColor: '#67e8f9', icon: '⚡', defaultTeacher: 'κος Αντωνίου', defaultRoom: 'Εργαστήριο Φυσικής' },
  { id: 'gym-ximeia', name: 'Χημεία', code: 'ΧΗΜ', color: '#8b5cf6', bgLight: '#f5f3ff', borderColor: '#c4b5fd', icon: '🧪', defaultTeacher: 'κα. Κωνσταντίνου', defaultRoom: 'Εργαστήριο Χημείας' },
  { id: 'gym-viologia', name: 'Βιολογία', code: 'ΒΙΟ', color: '#84cc16', bgLight: '#f7fee7', borderColor: '#bef264', icon: '🧬', defaultTeacher: 'κα. Κωνσταντίνου' },
  { id: 'gym-geografia', name: 'Γεωγραφία', code: 'ΓΕΩ', color: '#14b8a6', bgLight: '#f0fdfa', borderColor: '#5eead4', icon: '🌍' },
  { id: 'gym-english', name: 'Αγγλικά', code: 'ΑΓΓ', color: '#6366f1', bgLight: '#eef2ff', borderColor: '#a5b4fc', icon: '🇬🇧', defaultTeacher: 'κα. Davis' },
  { id: 'gym-foreign2', name: '2η Ξένη Γλώσσα (Γαλλ/Γερμ)', code: 'ΞΕΝ', color: '#a855f7', bgLight: '#faf5ff', borderColor: '#d8b4fe', icon: '🗺️' },
  { id: 'gym-pliroforiki', name: 'Πληροφορική', code: 'ΠΛΗ', color: '#0284c7', bgLight: '#f0f9ff', borderColor: '#7dd3fc', icon: '💻', defaultTeacher: 'κος Βασιλείου', defaultRoom: 'Εργαστήριο Η/Υ' },
  { id: 'gym-texnologia', name: 'Τεχνολογία', code: 'ΤΕΧ', color: '#64748b', bgLight: '#f8fafc', borderColor: '#cbd5e1', icon: '⚙️', defaultRoom: 'Αίθουσα Τεχνολογίας' },
  { id: 'gym-gymnastiki', name: 'Φυσική Αγωγή', code: 'ΓΥΜ', color: '#ec4899', bgLight: '#fdf2f8', borderColor: '#f472b6', icon: '⚽', defaultTeacher: 'κος Μιχάλης', defaultRoom: 'Κλειστό Γυμναστήριο' },
  { id: 'gym-kallitexnika', name: 'Καλλιτεχνικά', code: 'ΚΑΛ', color: '#f43f5e', bgLight: '#fff1f2', borderColor: '#fda4af', icon: '🎨' },
  { id: 'gym-mousiki', name: 'Μουσική', code: 'ΜΟΥ', color: '#d946ef', bgLight: '#fdf4ff', borderColor: '#f0abfc', icon: '🎵' },
  { id: 'gym-thriskeftika', name: 'Θρησκευτικά', code: 'ΘΡΗ', color: '#78716c', bgLight: '#f5f5f4', borderColor: '#d6d3d1', icon: '🕊️' },
  { id: 'gym-kpa', name: 'Κοινωνική & Πολιτική Αγωγή', code: 'ΚΠΑ', color: '#0ea5e9', bgLight: '#f0f9ff', borderColor: '#bae6fd', icon: '⚖️' },
];

export const LYCEUM_SUBJECTS: Subject[] = [
  { id: 'lyc-glossa', name: 'Νεοελληνική Γλώσσα & Λογ.', code: 'ΕΚΘ', color: '#3b82f6', bgLight: '#eff6ff', borderColor: '#93c5fd', icon: '📖', defaultTeacher: 'κα. Δημητρίου' },
  { id: 'lyc-algebra', name: 'Άλγεβρα', code: 'ΑΛΓ', color: '#10b981', bgLight: '#ecfdf5', borderColor: '#6ee7b7', icon: '📐', defaultTeacher: 'κος Νικολάου' },
  { id: 'lyc-geom', name: 'Γεωμετρία', code: 'ΓΕΩ', color: '#059669', bgLight: '#ecfdf5', borderColor: '#a7f3d0', icon: '📏', defaultTeacher: 'κος Νικολάου' },
  { id: 'lyc-fysiki', name: 'Φυσική', code: 'ΦΥΣ', color: '#06b6d4', bgLight: '#ecfeff', borderColor: '#67e8f9', icon: '⚡', defaultTeacher: 'κος Παυλίδης' },
  { id: 'lyc-ximeia', name: 'Χημεία', code: 'ΧΗΜ', color: '#8b5cf6', bgLight: '#f5f3ff', borderColor: '#c4b5fd', icon: '🧪' },
  { id: 'lyc-viologia', name: 'Βιολογία', code: 'ΒΙΟ', color: '#84cc16', bgLight: '#f7fee7', borderColor: '#bef264', icon: '🧬' },
  { id: 'lyc-istoria', name: 'Ιστορία', code: 'ΙΣΤ', color: '#f59e0b', bgLight: '#fffbeb', borderColor: '#fcd34d', icon: '🏛️' },
  { id: 'lyc-arxaia', name: 'Αρχαία Ελληνικά', code: 'ΑΡΧ', color: '#d97706', bgLight: '#fffbeb', borderColor: '#fde68a', icon: '📜' },
  { id: 'lyc-english', name: 'Αγγλικά', code: 'ΑΓΓ', color: '#6366f1', bgLight: '#eef2ff', borderColor: '#a5b4fc', icon: '🇬🇧' },
  { id: 'lyc-pliroforiki', name: 'Πληροφορική', code: 'ΠΛΗ', color: '#0284c7', bgLight: '#f0f9ff', borderColor: '#7dd3fc', icon: '💻' },
  { id: 'lyc-gym', name: 'Φυσική Αγωγή', code: 'ΓΥΜ', color: '#ec4899', bgLight: '#fdf2f8', borderColor: '#f472b6', icon: '⚽' },
  { id: 'lyc-relig', name: 'Θρησκευτικά', code: 'ΘΡΗ', color: '#64748b', bgLight: '#f8fafc', borderColor: '#cbd5e1', icon: '🕊️' },
  { id: 'lyc-kat-thetikis', name: 'Μαθηματικά Προσανατολισμού', code: 'ΜΑΘ-Π', color: '#047857', bgLight: '#ecfdf5', borderColor: '#34d399', icon: '🧮' },
  { id: 'lyc-kat-fysiki', name: 'Φυσική Προσανατολισμού', code: 'ΦΥΣ-Π', color: '#0891b2', bgLight: '#ecfeff', borderColor: '#22d3ee', icon: '⚡' },
  { id: 'lyc-kat-arxaia', name: 'Αρχαία Προσανατολισμού', code: 'ΑΡΧ-Π', color: '#b45309', bgLight: '#fffbeb', borderColor: '#f59e0b', icon: '🏛️' },
];

export function createSampleGymnasiumSchedule(): ScheduleSlot[] {
  return [
    // Δευτέρα
    { day: 'monday', periodId: 1, subjectId: 'gym-glossa', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'monday', periodId: 2, subjectId: 'gym-glossa', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'monday', periodId: 3, subjectId: 'gym-math', teacher: 'κος Παπαδόπουλος', room: 'Αίθ. 14' },
    { day: 'monday', periodId: 4, subjectId: 'gym-istoria', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'monday', periodId: 5, subjectId: 'gym-fysiki', teacher: 'κος Αντωνίου', room: 'Εργαστήριο' },
    { day: 'monday', periodId: 6, subjectId: 'gym-gymnastiki', teacher: 'κος Μιχάλης', room: 'Γήπεδο' },
    { day: 'monday', periodId: 7, subjectId: 'gym-english', teacher: 'κα. Davis', room: 'Αίθ. 14' },

    // Τρίτη
    { day: 'tuesday', periodId: 1, subjectId: 'gym-arxaia', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'tuesday', periodId: 2, subjectId: 'gym-arxaia', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'tuesday', periodId: 3, subjectId: 'gym-math', teacher: 'κος Παπαδόπουλος', room: 'Αίθ. 14' },
    { day: 'tuesday', periodId: 4, subjectId: 'gym-viologia', teacher: 'κα. Κωνσταντίνου', room: 'Αίθ. 14' },
    { day: 'tuesday', periodId: 5, subjectId: 'gym-pliroforiki', teacher: 'κος Βασιλείου', room: 'Εργαστήριο Η/Υ' },
    { day: 'tuesday', periodId: 6, subjectId: 'gym-mousiki', room: 'Αίθ. Μουσικής' },
    { day: 'tuesday', periodId: 7, subjectId: 'gym-thriskeftika' },

    // Τετάρτη
    { day: 'wednesday', periodId: 1, subjectId: 'gym-math', teacher: 'κος Παπαδόπουλος', room: 'Αίθ. 14' },
    { day: 'wednesday', periodId: 2, subjectId: 'gym-glossa', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'wednesday', periodId: 3, subjectId: 'gym-ximeia', teacher: 'κα. Κωνσταντίνου', room: 'Εργαστήριο' },
    { day: 'wednesday', periodId: 4, subjectId: 'gym-english', teacher: 'κα. Davis', room: 'Αίθ. 14' },
    { day: 'wednesday', periodId: 5, subjectId: 'gym-geografia', room: 'Αίθ. 14' },
    { day: 'wednesday', periodId: 6, subjectId: 'gym-texnologia', room: 'Εργαστήριο Τεχν.' },
    { day: 'wednesday', periodId: 7, subjectId: 'gym-gymnastiki', teacher: 'κος Μιχάλης', room: 'Γήπεδο' },

    // Πέμπτη
    { day: 'thursday', periodId: 1, subjectId: 'gym-arxaia', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'thursday', periodId: 2, subjectId: 'gym-istoria', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'thursday', periodId: 3, subjectId: 'gym-fysiki', teacher: 'κος Αντωνίου', room: 'Εργαστήριο' },
    { day: 'thursday', periodId: 4, subjectId: 'gym-math', teacher: 'κος Παπαδόπουλος', room: 'Αίθ. 14' },
    { day: 'thursday', periodId: 5, subjectId: 'gym-foreign2', room: 'Αίθ. 14' },
    { day: 'thursday', periodId: 6, subjectId: 'gym-kallitexnika', room: 'Αίθ. Τέχνης' },
    { day: 'thursday', periodId: 7, subjectId: 'gym-thriskeftika' },

    // Παρασκευή
    { day: 'friday', periodId: 1, subjectId: 'gym-glossa', teacher: 'κα. Γεωργίου', room: 'Αίθ. 14' },
    { day: 'friday', periodId: 2, subjectId: 'gym-math', teacher: 'κος Παπαδόπουλος', room: 'Αίθ. 14' },
    { day: 'friday', periodId: 3, subjectId: 'gym-pliroforiki', teacher: 'κος Βασιλείου', room: 'Εργαστήριο Η/Υ' },
    { day: 'friday', periodId: 4, subjectId: 'gym-english', teacher: 'κα. Davis', room: 'Αίθ. 14' },
    { day: 'friday', periodId: 5, subjectId: 'gym-foreign2', room: 'Αίθ. 14' },
    { day: 'friday', periodId: 6, subjectId: 'gym-kpa', room: 'Αίθ. 14' },
    { day: 'friday', periodId: 7, subjectId: 'gym-gymnastiki', teacher: 'κος Μιχάλης', room: 'Γήπεδο' },
  ];
}

export function getDefaultProfileForLevel(level: SchoolLevel, name: string = 'Μαθητής', className: string = ''): Profile {
  const now = new Date().toISOString();
  
  if (level === 'kindergarten') {
    return {
      id: 'profile-kindergarten-' + Date.now(),
      name: name || 'Μαθητής Νηπιαγωγείου',
      schoolLevel: 'kindergarten',
      className: className || 'Νήπιο',
      schoolName: '1ο Νηπιαγωγείο',
      schoolYear: '2026-2027',
      showSaturday: false,
      departureTime: '13:00',
      departureNote: 'Βασικό Πρόγραμμα (13:00)',
      periods: KINDERGARTEN_PERIODS,
      subjects: KINDERGARTEN_SUBJECTS,
      schedule: [],
      tasks: [],
      afternoonActivities: [
        {
          id: 'act-swim-kin',
          name: 'Κολύμβηση',
          icon: '🏊',
          color: '#0891b2',
          bgLight: '#ecfeff',
          borderColor: '#67e8f9',
          days: ['tuesday', 'thursday'],
          startTime: '17:00',
          endTime: '18:00',
          location: 'Δημοτικό Κολυμβητήριο',
          instructor: 'κα. Μαρία',
          notes: 'Μαγιό, σκουφάκι & μπουρνούζι',
        },
      ],
      updatedAt: now,
    };
  }

  if (level === 'primary') {
    return {
      id: 'profile-primary-' + Date.now(),
      name: name || 'Μαθητής Δημοτικού',
      schoolLevel: 'primary',
      className: className || 'Ε\' Δημοτικού',
      schoolName: '1ο Δημοτικό Σχολείο',
      schoolYear: '2026-2027',
      showSaturday: false,
      showAllDay: true,
      departureTime: '14:55',
      departureNote: 'Ολοήμερο (1η Ζώνη)',
      periods: PRIMARY_PERIODS,
      subjects: PRIMARY_SUBJECTS,
      schedule: [
        { day: 'monday', periodId: 1, subjectId: 'pri-glossa' },
        { day: 'monday', periodId: 2, subjectId: 'pri-glossa' },
        { day: 'monday', periodId: 3, subjectId: 'pri-math' },
        { day: 'monday', periodId: 4, subjectId: 'pri-istoria' },
        { day: 'monday', periodId: 5, subjectId: 'pri-gym' },
        { day: 'monday', periodId: 6, subjectId: 'pri-music' },
        { day: 'monday', periodId: 7, subjectId: 'pri-sitisi' },
        { day: 'monday', periodId: 8, subjectId: 'pri-meleti-olohmero' },
        
        { day: 'tuesday', periodId: 1, subjectId: 'pri-glossa' },
        { day: 'tuesday', periodId: 2, subjectId: 'pri-math' },
        { day: 'tuesday', periodId: 3, subjectId: 'pri-fysika' },
        { day: 'tuesday', periodId: 4, subjectId: 'pri-english' },
        { day: 'tuesday', periodId: 5, subjectId: 'pri-tpe' },
        { day: 'tuesday', periodId: 6, subjectId: 'pri-art' },
        { day: 'tuesday', periodId: 7, subjectId: 'pri-sitisi' },
        { day: 'tuesday', periodId: 8, subjectId: 'pri-meleti-olohmero' },

        { day: 'wednesday', periodId: 1, subjectId: 'pri-glossa' },
        { day: 'wednesday', periodId: 2, subjectId: 'pri-math' },
        { day: 'wednesday', periodId: 3, subjectId: 'pri-istoria' },
        { day: 'wednesday', periodId: 4, subjectId: 'pri-meleti' },
        { day: 'wednesday', periodId: 5, subjectId: 'pri-french' },
        { day: 'wednesday', periodId: 6, subjectId: 'pri-gym' },
        { day: 'wednesday', periodId: 7, subjectId: 'pri-sitisi' },
        { day: 'wednesday', periodId: 8, subjectId: 'pri-meleti-olohmero' },

        { day: 'thursday', periodId: 1, subjectId: 'pri-glossa' },
        { day: 'thursday', periodId: 2, subjectId: 'pri-math' },
        { day: 'thursday', periodId: 3, subjectId: 'pri-fysika' },
        { day: 'thursday', periodId: 4, subjectId: 'pri-english' },
        { day: 'thursday', periodId: 5, subjectId: 'pri-theatre' },
        { day: 'thursday', periodId: 6, subjectId: 'pri-relig' },
        { day: 'thursday', periodId: 7, subjectId: 'pri-sitisi' },
        { day: 'thursday', periodId: 8, subjectId: 'pri-meleti-olohmero' },

        { day: 'friday', periodId: 1, subjectId: 'pri-glossa' },
        { day: 'friday', periodId: 2, subjectId: 'pri-math' },
        { day: 'friday', periodId: 3, subjectId: 'pri-tpe' },
        { day: 'friday', periodId: 4, subjectId: 'pri-french' },
        { day: 'friday', periodId: 5, subjectId: 'pri-gym' },
        { day: 'friday', periodId: 6, subjectId: 'pri-art' },
        { day: 'friday', periodId: 7, subjectId: 'pri-sitisi' },
        { day: 'friday', periodId: 8, subjectId: 'pri-meleti-olohmero' },
      ],
      tasks: [
        {
          id: 'task-1',
          subjectId: 'pri-math',
          title: 'Ασκήσεις 1-3 στο βιβλίο μαθητή, σελίδα 24',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          completed: false,
          priority: 'high',
          createdAt: now,
        },
        {
          id: 'task-2',
          subjectId: 'pri-glossa',
          title: 'Ανάγνωση κεφ. 2 & ορθογραφία',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          completed: false,
          priority: 'normal',
          createdAt: now,
        },
      ],
      afternoonActivities: [
        {
          id: 'act-stivos-primary',
          name: 'Στίβος',
          icon: '🏃',
          color: '#ea580c',
          bgLight: '#fff7ed',
          borderColor: '#fdba74',
          days: ['monday', 'wednesday'],
          startTime: '17:30',
          endTime: '19:00',
          location: 'Δημοτικό Στάδιο',
          instructor: 'Προπονητής: κ. Κώστας',
          notes: 'Αθλητική φόρμα & παπούτσια στίβου',
        },
        {
          id: 'act-agg-primary',
          name: 'Αγγλικά',
          icon: '🇬🇧',
          color: '#4f46e5',
          bgLight: '#eef2ff',
          borderColor: '#a5b4fc',
          days: ['tuesday', 'thursday'],
          startTime: '16:30',
          endTime: '18:00',
          location: 'Κέντρο Ξένων Γλωσσών',
          instructor: 'κα. Davis',
          notes: 'Coursebook & Activity Book',
        },
      ],
      updatedAt: now,
    };
  }

  if (level === 'lyceum') {
    return {
      id: 'profile-lyceum-' + Date.now(),
      name: name || 'Μαθητής Λυκείου',
      schoolLevel: 'lyceum',
      className: className || 'Β\' Λυκείου',
      schoolName: '2ο Γενικό Λύκειο',
      schoolYear: '2026-2027',
      showSaturday: false,
      departureTime: '14:10',
      departureNote: '7ωρο Πρόγραμμα',
      periods: LYCEUM_PERIODS,
      subjects: LYCEUM_SUBJECTS,
      schedule: [],
      tasks: [],
      updatedAt: now,
    };
  }

  // Default: Gymnasium
  return {
    id: 'profile-gymnasium-default',
    name: name || 'Γιώργος Παπαδόπουλος',
    schoolLevel: 'gymnasium',
    className: className || 'Β\' Γυμνασίου (Τμήμα Β2)',
    schoolName: '3ο Γυμνάσιο',
    schoolYear: '2026-2027',
    showSaturday: false,
    departureTime: '14:10',
    departureNote: '7ωρο Πρόγραμμα',
    periods: GYMNASIUM_PERIODS,
    subjects: GYMNASIUM_SUBJECTS,
    schedule: createSampleGymnasiumSchedule(),
    tasks: [
      {
        id: 'task-1',
        subjectId: 'gym-math',
        title: 'Ασκήσεις Άλγεβρας σελ. 48 ασκ. 3, 5, 8',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        completed: false,
        priority: 'high',
        createdAt: now,
      },
      {
        id: 'task-2',
        subjectId: 'gym-istoria',
        title: 'Επανάληψη Κεφάλαιο 1 - Η Βυζαντινή Αυτοκρατορία',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        completed: false,
        priority: 'normal',
        createdAt: now,
      },
      {
        id: 'task-3',
        subjectId: 'gym-fysiki',
        title: 'Φέρτε τετράδιο εργαστηρίου για το πείραμα',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        completed: true,
        priority: 'low',
        createdAt: now,
      },
    ],
    updatedAt: now,
  };
}

export function getInitialTimetableData(): { activeProfileId: string; profiles: Profile[] } {
  const gymProfile = getDefaultProfileForLevel('gymnasium', 'Γιώργος Παπαδόπουλος', 'Β\' Γυμνασίου (Β2)');
  const priProfile = getDefaultProfileForLevel('primary', 'Μαρία Παπαδοπούλου', 'Δ\' Δημοτικού');

  return {
    activeProfileId: gymProfile.id,
    profiles: [gymProfile, priProfile],
  };
}
