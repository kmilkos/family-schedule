import { FamilyMember, GreekHoliday, DayOfWeek, ShiftEntry, AfternoonActivity, SchoolLevel } from '../types';
import { getFullEndTime } from './shiftCalculations';

export interface DayCommitment {
  memberId: string;
  memberName: string;
  memberRole: 'worker' | 'student';
  memberColor: string;
  memberAvatar: string;
  date: string;
  dayNameGreek: string;
  // Summary tags
  primaryStatus: string; // e.g. "09:00 - 17:00 Βάρδια" or "Σχολείο 08:15 - 13:15"
  statusBadgeType: 'work' | 'repo' | 'leave' | 'school' | 'empty';
  busyWindows: { start: string; end: string; title: string; type: 'work' | 'school' | 'activity' | 'event'; notes?: string }[];
  details: {
    workerShift?: ShiftEntry;
    schoolSubjects?: string[];
    activities?: AfternoonActivity[];
    tasksCount?: number;
    schoolLevel?: SchoolLevel;
    departureTime?: string;
    departureNote?: string;
    showAllDay?: boolean;
    isAllDay?: boolean;
  };
}

export interface DayLogisticsSummary {
  date: string;
  dayNameGreek: string;
  isSunday: boolean;
  isSaturday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  commitments: DayCommitment[];
  logisticsNotes: {
    type: 'success' | 'warning' | 'info';
    message: string;
    details?: string;
  }[];
  commonFreeWindows: string[];
}

const GREEK_DAYS_MAP: Record<number, { day: DayOfWeek; greek: string }> = {
  1: { day: 'monday', greek: 'Δευτέρα' },
  2: { day: 'tuesday', greek: 'Τρίτη' },
  3: { day: 'wednesday', greek: 'Τετάρτη' },
  4: { day: 'thursday', greek: 'Πέμπτη' },
  5: { day: 'friday', greek: 'Παρασκευή' },
  6: { day: 'saturday', greek: 'Σάββατο' },
  0: { day: 'sunday', greek: 'Κυριακή' },
};

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Return 7 days of the week containing the given date (starts on Monday)
export function getWeekDays(referenceDate: Date = new Date()): { dateStr: string; dayOfWeek: DayOfWeek; greekName: string; date: Date }[] {
  const cur = new Date(referenceDate);
  const dayOfWeekIdx = cur.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = (dayOfWeekIdx + 6) % 7;
  
  const monday = new Date(cur);
  monday.setDate(cur.getDate() - distanceToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDate(d);
    const idx = d.getDay();
    days.push({
      dateStr,
      dayOfWeek: GREEK_DAYS_MAP[idx].day,
      greekName: GREEK_DAYS_MAP[idx].greek,
      date: d,
    });
  }
  return days;
}

export function getMemberCommitment(member: FamilyMember, dateStr: string, holidays: GreekHoliday[]): DayCommitment {
  const d = parseDate(dateStr);
  const idx = d.getDay();
  const { day: dayKey, greek: greekDay } = GREEK_DAYS_MAP[idx];

  const commitment: DayCommitment = {
    memberId: member.id,
    memberName: member.name,
    memberRole: member.role,
    memberColor: member.color,
    memberAvatar: member.avatar,
    date: dateStr,
    dayNameGreek: greekDay,
    primaryStatus: '',
    statusBadgeType: 'empty',
    busyWindows: [],
    details: {},
  };

  if (member.role === 'worker') {
    const shift = member.workerData?.shifts?.[dateStr];
    commitment.details.workerShift = shift;

    if (!shift || shift.type === 'EMPTY') {
      commitment.primaryStatus = 'Μη ορισμένο';
      commitment.statusBadgeType = 'empty';
    } else if (shift.type === 'REPO') {
      commitment.primaryStatus = 'Ρεπό';
      commitment.statusBadgeType = 'repo';
    } else if (shift.type === 'ADEIA') {
      commitment.primaryStatus = 'Κανονική Άδεια';
      commitment.statusBadgeType = 'leave';
    } else if (shift.type === 'SICK') {
      commitment.primaryStatus = 'Αναρρωτική Άδεια';
      commitment.statusBadgeType = 'leave';
    } else if (shift.type === 'ARGIA') {
      commitment.primaryStatus = 'Αργία';
      commitment.statusBadgeType = 'repo';
    } else if (shift.type === 'WORK') {
      const start = shift.startTime || '09:00';
      const baseEnd = shift.endTime || '17:00';
      const end = getFullEndTime(baseEnd, shift.extraHours);
      commitment.primaryStatus = `${start} - ${end}${shift.isOvernight ? ' (Νυχτερινό)' : ''}`;
      commitment.statusBadgeType = 'work';
      commitment.busyWindows.push({
        start,
        end,
        title: 'Εργασία',
        type: 'work',
        notes: shift.notes,
      });
    }
  } else if (member.role === 'student') {
    const student = member.studentData;
    const isWeekend = dayKey === 'saturday' || dayKey === 'sunday';

    // 1. School slots for dayKey
    const daySlots = student?.schedule?.filter((s) => s.day === dayKey) || [];
    const subjectsMap = new Map(student?.subjects?.map((sub) => [sub.id, sub.name]));
    const subjectNames = daySlots
      .map((s) => s.subjectId ? subjectsMap.get(s.subjectId) : undefined)
      .filter((n): n is string => Boolean(n));

    commitment.details.schoolSubjects = subjectNames;

    // Determine school/kindergarten hours
    const isKindergarten = student?.schoolLevel === 'kindergarten';
    const departureTime = student?.departureTime;
    const isAllDay = !isKindergarten && Boolean(
      student?.showAllDay || (departureTime && departureTime > '13:15') || student?.departureNote?.includes('Ολοήμερο')
    );

    commitment.details.schoolLevel = student?.schoolLevel;
    commitment.details.departureTime = departureTime;
    commitment.details.departureNote = student?.departureNote;
    commitment.details.showAllDay = student?.showAllDay;
    commitment.details.isAllDay = isAllDay;

    if (!isWeekend) {
      if (isKindergarten) {
        const start = '08:15';
        const end = departureTime || '13:00';
        commitment.primaryStatus = `Νηπιαγωγείο ${start} - ${end}`;
        commitment.statusBadgeType = 'school';
        commitment.busyWindows.push({
          start,
          end,
          title: 'Νηπιαγωγείο',
          type: 'school',
        });
      } else if (daySlots.length > 0 && student?.periods && student.periods.length > 0) {
        const sortedPeriods = [...student.periods].sort((a, b) => a.id - b.id);
        const start = sortedPeriods[0].startTime;
        const end = departureTime || sortedPeriods[sortedPeriods.length - 1].endTime;
        const label = isAllDay ? 'Σχολείο & Ολοήμερο' : 'Σχολείο';
        commitment.primaryStatus = `${label} ${start} - ${end}`;
        commitment.statusBadgeType = 'school';
        commitment.busyWindows.push({
          start,
          end,
          title: label,
          type: 'school',
        });
      } else if (departureTime) {
        const start = '08:15';
        const end = departureTime;
        const label = isAllDay ? 'Σχολείο & Ολοήμερο' : 'Σχολείο';
        commitment.primaryStatus = `${label} ${start} - ${end}`;
        commitment.statusBadgeType = 'school';
        commitment.busyWindows.push({
          start,
          end,
          title: label,
          type: 'school',
        });
      } else {
        commitment.primaryStatus = 'Χωρίς μαθήματα';
        commitment.statusBadgeType = 'repo';
      }
    } else {
      commitment.primaryStatus = 'Σαββατοκύριακο';
      commitment.statusBadgeType = 'repo';
    }

    // 2. Afternoon Activities for dayKey
    const activities = student?.afternoonActivities?.filter((a) => a.days?.includes(dayKey)) || [];
    commitment.details.activities = activities;
    for (const act of activities) {
      commitment.busyWindows.push({
        start: act.startTime,
        end: act.endTime,
        title: `${act.icon || '⭐'} ${act.name}`,
        type: 'activity',
        notes: act.location ? `Τοποθεσία: ${act.location}` : undefined,
      });
    }

    // 3. Tasks due on this day
    const tasksDue = student?.tasks?.filter((t) => t.dueDate === dateStr && !t.completed) || [];
    commitment.details.tasksCount = tasksDue.length;
  }

  return commitment;
}

export function analyzeDayLogistics(
  members: FamilyMember[],
  dateStr: string,
  holidays: GreekHoliday[]
): DayLogisticsSummary {
  const d = parseDate(dateStr);
  const idx = d.getDay();
  const isSun = idx === 0;
  const isSat = idx === 6;
  const holiday = holidays.find((h) => h.date === dateStr);
  const isHol = !!holiday;

  const commitments = members.map((m) => getMemberCommitment(m, dateStr, holidays));
  const logisticsNotes: DayLogisticsSummary['logisticsNotes'] = [];

  const workers = commitments.filter((c) => c.memberRole === 'worker');
  const students = commitments.filter((c) => c.memberRole === 'student');

  // Check child pickups and activities
  for (const student of students) {
    // School finish pickup
    const schoolWindow = student.busyWindows.find((b) => b.type === 'school');
    if (schoolWindow) {
      const finishTime = schoolWindow.end; // e.g. "13:15"
      const availableWorkers = workers.filter((w) => {
        // worker is free if they are on repo/leave OR their shift doesn't overlap finishTime
        if (w.statusBadgeType === 'repo' || w.statusBadgeType === 'leave') return true;
        const workWin = w.busyWindows.find((b) => b.type === 'work');
        if (!workWin) return true;
        return finishTime < workWin.start || finishTime >= workWin.end;
      });

      if (availableWorkers.length > 0) {
        logisticsNotes.push({
          type: 'success',
          message: `Σχόλασμα ${student.memberName} (${finishTime}): Διαθέσιμος για παραλαβή: ${availableWorkers.map((w) => w.memberName).join(', ')}`,
        });
      } else if (workers.length > 0) {
        logisticsNotes.push({
          type: 'warning',
          message: `Προσοχή: Σχόλασμα ${student.memberName} (${finishTime}): Όλοι οι εργαζόμενοι έχουν βάρδια!`,
        });
      }
    }

    // Activities ride
    if (student.details.activities && student.details.activities.length > 0) {
      for (const act of student.details.activities) {
        const actStart = act.startTime;
        const availableWorkers = workers.filter((w) => {
          if (w.statusBadgeType === 'repo' || w.statusBadgeType === 'leave') return true;
          const workWin = w.busyWindows.find((b) => b.type === 'work');
          if (!workWin) return true;
          return actStart < workWin.start || actStart >= workWin.end;
        });

        if (availableWorkers.length > 0) {
          logisticsNotes.push({
            type: 'info',
            message: `${act.icon || '⭐'} ${act.name} (${student.memberName} ${act.startTime}-${act.endTime}): Συνοδεία δυνατή από ${availableWorkers.map((w) => w.memberName).join(', ')}`,
          });
        } else if (workers.length > 0) {
          logisticsNotes.push({
            type: 'warning',
            message: `⚠️ Επικάλυψη: ${act.name} (${act.startTime}) και όλοι οι εργαζόμενοι εργάζονται!`,
          });
        }
      }
    }
  }

  // Check if everyone has free time together (all on repo or after 17:00/18:00)
  const allWorkersFree = workers.every((w) => w.statusBadgeType === 'repo' || w.statusBadgeType === 'leave');
  if (allWorkersFree && workers.length > 0) {
    logisticsNotes.push({
      type: 'success',
      message: `🎉 Κοινό Ρεπό / Ελεύθερη Ημέρα για όλους τους εργαζόμενους!`,
    });
  }

  return {
    date: dateStr,
    dayNameGreek: GREEK_DAYS_MAP[idx].greek,
    isSunday: isSun,
    isSaturday: isSat,
    isHoliday: isHol,
    holidayName: holiday?.name,
    commitments,
    logisticsNotes,
    commonFreeWindows: allWorkersFree ? ['Όλη την ημέρα'] : ['Μετά τις 19:00'],
  };
}
