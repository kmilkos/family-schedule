export type MemberRole = 'worker' | 'student';
export type UserRole = 'parent' | 'child'; // parent = Admin, child = Member

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// ==================== WORK ARRANGEMENT / ΜΟΡΦΕΣ ΕΡΓΑΣΙΑΣ ====================
export type WorkArrangement =
  | 'full_time'        // Πλήρης Απασχόληση (8ωρο / 40h)
  | 'part_time'        // Μερική Απασχόληση (4ωρο / 6ωρο)
  | 'rotating_shifts'  // Κυλιόμενο Ωράριο / Βάρδιες
  | 'split_shift'      // Σπαστό Ωράριο (2 σκέλη την ίδια μέρα)
  | 'remote'           // Τηλεργασία / Εργασία από το σπίτι (WFH)
  | 'hybrid'           // Υβριδική Εργασία (Γραφείο & Σπίτι)
  | 'freelance'        // Ελεύθερος Επαγγελματίας / Μπλοκάκι / Ευέλικτο
  | 'on_call';         // Εφημερία / Ετοιμότητα (Standby)

export const WORK_ARRANGEMENTS: { key: WorkArrangement; label: string; icon: string; description: string }[] = [
  { key: 'full_time', label: 'Πλήρης Απασχόληση', icon: '💼', description: 'Σταθερό 8ωρο συνεχές ωράριο (40 ώρες/εβδομάδα)' },
  { key: 'part_time', label: 'Μερική Απασχόληση', icon: '⏱️', description: '4ωρο, 6ωρο ή μειωμένο ωράριο εργασίας' },
  { key: 'rotating_shifts', label: 'Κυλιόμενες Βάρδιες', icon: '🔄', description: 'Πρωινές, απογευματινές, νυχτερινές βάρδιες & κυλιόμενα ρεπό' },
  { key: 'split_shift', label: 'Σπαστό Ωράριο', icon: '✂️', description: 'Δύο διακριτά ωράρια μέσα στην ίδια ημέρα (π.χ. πρωί & απόγευμα)' },
  { key: 'remote', label: 'Τηλεργασία (Home Office)', icon: '🏠', description: '100% εργασία εξ αποστάσεως χωρίς μετακίνηση' },
  { key: 'hybrid', label: 'Υβριδική Εργασία', icon: '🌐', description: 'Συνδυασμός εργασίας από γραφείο και από το σπίτι' },
  { key: 'freelance', label: 'Ελεύθερος Επαγγελματίας', icon: '💻', description: 'Ευέλικτο ωράριο, μπλοκάκι, καταγραφή χρόνου ανά έργο' },
  { key: 'on_call', label: 'Εφημερία / Ετοιμότητα', icon: '📞', description: 'Σε αναμονή κλήσης, επιφυλακή & έκτακτη επέμβαση' },
];

// ==================== WORKER TYPES ====================
export type DayType = 'WORK' | 'REPO' | 'ARGIA' | 'ADEIA' | 'SICK' | 'EMPTY';

export interface ShiftEntry {
  date: string; // YYYY-MM-DD
  type: DayType;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  isOvernight?: boolean;
  extraHours?: number; // fractional e.g. 1.5
  notes?: string;
  customHolidayName?: string;
  workArrangement?: WorkArrangement;
  isRemote?: boolean;
  isOnCall?: boolean;
  secondSlot?: {
    startTime: string;
    endTime: string;
    isOvernight?: boolean;
    extraHours?: number;
  };
}

export interface GreekHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  isBankingHoliday?: boolean;
  isCustom?: boolean;
}

export interface DayCalculation {
  date: string;
  dayType: DayType;
  isSunday: boolean;
  isSaturday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  regularHours: number;
  extraNormalHours: number;
  extraHolidayHours: number;
  nightNormalHours: number;
  nightHolidayHours: number;
  sundayHolidayWorkedHours: number;
  totalWorkedHours: number;
  isOvernight: boolean;
}

export interface MonthSummary {
  year: number;
  month: number;
  totalWorkDays: number;
  totalRepoDays: number;
  totalAdeiaDays: number;
  totalSickDays: number;
  totalArgiaDays: number;
  totalWorkedHours: number;
  regularHours: number;
  extraNormalHours: number;
  extraHolidayHours: number;
  nightNormalHours: number;
  nightHolidayHours: number;
  sundayHolidayWorkedHours: number;
  estimatedNightNormalPay: number;
  estimatedNightHolidayPay: number;
  estimatedHolidayWorkedPay: number;
  estimatedExtraNormalPay: number;
  estimatedExtraHolidayPay: number;
  estimatedTotalPremiums: number;
  hourlyWage: number;
}

export interface WagePeriod {
  id: string;
  startDate: string; // YYYY-MM-DD or YYYY-MM
  label: string;
  baseSalary: number;
  trienniumBonus: number;
  hourlyWageMode: 'auto' | 'custom';
  customHourlyWage: number;
}

export interface WageSettings {
  baseSalary: number;
  trienniumBonus?: number;
  hourlyWageMode: 'auto' | 'custom';
  customHourlyWage: number;
  workingDaysBase: number;
  dailyHoursBase: number;
  contractHours?: number; // 4, 6, 8 (standard daily contract hours)
  nightPremiumPercent: number;
  sundayHolidayPremiumPercent: number;
  overtimeWeekdayPercent: number;
  overtimeHolidayPercent: number;
  wagePeriods?: WagePeriod[];
}

export interface MemberDocument {
  id: string;
  title: string;
  category: 'contract' | 'ergani' | 'tax' | 'medical' | 'certificate' | 'other';
  protocolNumber?: string;
  submissionDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  directEmployer?: string;
  directEmployerAfm?: string;
  indirectEmployer?: string;
  indirectEmployerAfm?: string;
  workplaceLocation?: string;
  workScheduleSummary?: string;
  speciality?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  notes?: string;
  uploadedAt: string;
}

export interface EmploymentInfo {
  employer: string;
  employerAfm?: string;
  directEmployer?: string;
  directEmployerAfm?: string;
  workplace: string;
  contractType: string;
  contractDuration?: string;
  startDate?: string;
  endDate?: string;
  effectiveDate?: string;
  weeklyHours?: number;
  dailyHours?: number;
  breakDurationMinutes?: number;
  isBreakPaid?: boolean;
  digitalSchedule?: boolean;
  workCard?: boolean;
  specialityCode?: string;
  specialityName?: string;
  monthlySalary?: number;
  hourlyWage?: number;
}

export interface WorkerData {
  jobTitle?: string;
  workArrangement?: WorkArrangement;
  contractHours?: number; // 4, 6, 8
  shifts: Record<string, ShiftEntry>;
  wageSettings?: WageSettings;
  defaultShiftType?: string;
  employmentInfo?: EmploymentInfo;
  documents?: MemberDocument[];
}

// ==================== STUDENT TYPES ====================
export type SchoolLevel = 'kindergarten' | 'primary' | 'gymnasium' | 'lyceum' | 'custom';

export interface Period {
  id: number;
  label: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakAfterMinutes?: number;
  isAllDay?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color: string;
  textColor?: string;
  bgLight?: string;
  borderColor?: string;
  icon?: string;
  defaultTeacher?: string;
  defaultRoom?: string;
}

export interface ScheduleSlot {
  day: DayOfWeek;
  periodId: number;
  subjectId?: string;
  teacher?: string;
  room?: string;
  note?: string;
}

export interface HomeworkTask {
  id: string;
  subjectId?: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dayOfWeek?: DayOfWeek;
  completed: boolean;
  notes?: string;
  priority?: 'low' | 'normal' | 'high';
  createdAt: string;
}

export interface AfternoonActivity {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgLight?: string;
  borderColor?: string;
  days: DayOfWeek[];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  instructor?: string;
  notes?: string;
}

export interface StudentData {
  schoolLevel: SchoolLevel;
  schoolName?: string;
  className: string;
  schoolYear: string;
  showSaturday: boolean;
  showAllDay?: boolean;
  departureTime?: string; // HH:mm e.g. "13:00", "13:15", "16:00"
  departureNote?: string; // e.g. "Βασικό", "Ολοήμερο", "Διευρυμένο"
  periods: Period[];
  subjects: Subject[];
  schedule: ScheduleSlot[];
  tasks: HomeworkTask[];
  afternoonActivities: AfternoonActivity[];
}

export interface Profile {
  id: string;
  name: string;
  schoolLevel: SchoolLevel;
  className: string;
  schoolName?: string;
  schoolYear: string;
  showSaturday: boolean;
  showAllDay?: boolean;
  departureTime?: string;
  departureNote?: string;
  periods: Period[];
  subjects: Subject[];
  schedule: ScheduleSlot[];
  tasks: HomeworkTask[];
  afternoonActivities?: AfternoonActivity[];
  updatedAt: string;
}

// ==================== MULTI-USER & MULTI-CALENDAR ====================
export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  role: UserRole; // 'parent' (admin) | 'child' (member)
  avatar: string;
  color: string;
  hasPin: boolean;
  createdAt: string;
}

export type CalendarType = 'WORK_SHIFTS' | 'STUDENT_SCHEDULE' | 'GENERIC_EVENTS';

export interface UserCalendar {
  id: string;
  userId: string;
  name: string;
  type: CalendarType;
  color: string;
  isSharedWithFamily: boolean;
  workArrangement?: WorkArrangement;
  jobTitle?: string;
  contractHours?: number;
  wageSettings?: WageSettings;
  employmentInfo?: EmploymentInfo;
  studentData?: StudentData;
  createdAt: string;
}

export interface GenericCalendarEvent {
  id: string;
  calendarId: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  isAllDay?: boolean;
  location?: string;
  notes?: string;
  category?: 'personal' | 'medical' | 'social' | 'sports' | 'family' | 'other';
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string; // emoji or icon name
  color: string; // Hex color
  workerData?: WorkerData;
  studentData?: StudentData;
  documents?: MemberDocument[];
}

export interface SharedFamilyEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  assignedMemberIds: string[];
  category?: 'meal' | 'trip' | 'medical' | 'event' | 'other';
}

export interface FamilyNote {
  id: string;
  title: string;
  text: string;
  tag?: string;
  date?: string;
  authorUserId?: string;
}

export interface HouseholdData {
  householdName: string;
  members: FamilyMember[];
  holidays: GreekHoliday[];
  sharedEvents: SharedFamilyEvent[];
  familyNotes?: FamilyNote[];
  updatedAt: string;
}
