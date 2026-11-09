import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Briefcase,
  GraduationCap,
  Car,
  HeartHandshake,
  Activity,
  Plus,
  CheckSquare,
  Square,
  RefreshCw,
  StickyNote,
  User,
  Trash2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Check,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FamilyMember, GreekHoliday, ShiftEntry, DayOfWeek, FamilyNote, HomeworkTask } from '../../types';
import { getWeekDays, analyzeDayLogistics, formatDate } from '../../utils/familyLogistics';
import { calculateShift, getFullEndTime } from '../../utils/shiftCalculations';

interface MasterWeeklyViewProps {
  members: FamilyMember[];
  holidays: GreekHoliday[];
  familyNotes?: FamilyNote[];
  onUpdateFamilyNotes?: (notes: FamilyNote[]) => void;
  onUpdateMember?: (updated: FamilyMember) => void;
  onQuickEditShift?: (memberId: string, dateStr: string) => void;
  onSelectMember?: (memberId: string) => void;
  onRefresh?: () => void;
}

// ISO Week Number Helper
function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export const MasterWeeklyView: React.FC<MasterWeeklyViewProps> = ({
  members,
  holidays,
  familyNotes = [],
  onUpdateFamilyNotes,
  onUpdateMember,
  onQuickEditShift,
  onSelectMember,
  onRefresh,
}) => {
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [viewLayout, setViewLayout] = useState<'grid' | 'timeline'>('grid');
  const [selectedDayModal, setSelectedDayModal] = useState<string | null>(null);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<'all' | string>('all');

  // New Note Modal / Inline Form State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Σπίτι');

  const todayDate = new Date();
  const todayStr = formatDate(todayDate);

  // 7 days of the active week (Monday to Sunday)
  const weekDays = useMemo(() => getWeekDays(referenceDate), [referenceDate]);

  // Analyzed daily logistics for the week
  const weekLogistics = useMemo(() => {
    return weekDays.map((d) => analyzeDayLogistics(members, d.dateStr, holidays));
  }, [weekDays, members, holidays]);

  // Today's logistics
  const todayLogistics = useMemo(() => {
    return analyzeDayLogistics(members, todayStr, holidays);
  }, [members, todayStr, holidays]);

  // Workers and students
  const workerMembers = useMemo(() => members.filter((m) => m.role === 'worker'), [members]);
  const studentMembers = useMemo(() => members.filter((m) => m.role === 'student'), [members]);

  const primaryWorker = workerMembers[0];
  const primaryStudent = studentMembers[0];

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const activeWorker = useMemo(() => {
    if (selectedMemberFilter !== 'all' && workerMembers.some((w) => w.id === selectedMemberFilter)) {
      return workerMembers.find((w) => w.id === selectedMemberFilter) || workerMembers[0];
    }
    return workerMembers.find((w) => w.id === selectedWorkerId) || workerMembers[0];
  }, [workerMembers, selectedMemberFilter, selectedWorkerId]);

  const activeStudent = useMemo(() => {
    if (selectedMemberFilter !== 'all' && studentMembers.some((s) => s.id === selectedMemberFilter)) {
      return studentMembers.find((s) => s.id === selectedMemberFilter) || studentMembers[0];
    }
    return studentMembers.find((s) => s.id === selectedStudentId) || studentMembers[0];
  }, [studentMembers, selectedMemberFilter, selectedStudentId]);

  // Week navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(referenceDate);
    prev.setDate(prev.getDate() - 7);
    setReferenceDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + 7);
    setReferenceDate(next);
  };

  const handleTodayWeek = () => {
    setReferenceDate(new Date());
  };

  const firstDayStr = weekDays[0].dateStr;
  const lastDayStr = weekDays[6].dateStr;
  const activeWeekNumber = getWeekNumber(referenceDate);

  const activeDaySummary = useMemo(() => {
    if (!selectedDayModal) return null;
    return weekLogistics.find((wl) => wl.date === selectedDayModal) || null;
  }, [selectedDayModal, weekLogistics]);

  // Any collisions or warnings in the current week?
  const weeklyWarnings = useMemo(() => {
    const list: { day: string; date: string; message: string }[] = [];
    for (const d of weekLogistics) {
      const warnings = d.logisticsNotes.filter((n) => n.type === 'warning');
      if (warnings.length > 0) {
        list.push({
          day: d.dayNameGreek,
          date: d.date,
          message: `${warnings.length} επικάλυψη/προειδοποίηση logistics`,
        });
      }
    }
    return list;
  }, [weekLogistics]);

  // Computed stats for all workers
  const allWorkersStats = useMemo(() => {
    return workerMembers.map((worker) => {
      if (!worker.workerData?.shifts) {
        return {
          worker,
          totalHours: 0,
          shiftCount: 0,
          morningCount: 0,
          afternoonCount: 0,
          nightCount: 0,
          repoCount: 0,
          extraHours: 0,
          nextRepoDay: 'Κανένα',
        };
      }
      const shifts = worker.workerData.shifts;
      let totalHours = 0;
      let shiftCount = 0;
      let morningCount = 0;
      let afternoonCount = 0;
      let nightCount = 0;
      let repoCount = 0;
      let extraHours = 0;
      let nextRepoDay = '';

      for (const d of weekDays) {
        const s = shifts[d.dateStr];
        if (s?.type === 'WORK') {
          shiftCount++;
          const calc = calculateShift(s, holidays);
          totalHours += calc.totalWorkedHours;
          extraHours += calc.extraNormalHours + calc.extraHolidayHours;
          const startHour = s.startTime ? parseInt(s.startTime.split(':')[0], 10) : 9;
          if (s.isOvernight || startHour >= 21 || startHour < 6) {
            nightCount++;
          } else if (startHour >= 14) {
            afternoonCount++;
          } else {
            morningCount++;
          }
        } else if (s?.type === 'REPO' || s?.type === 'ARGIA') {
          repoCount++;
          if (!nextRepoDay && d.dateStr >= todayStr) {
            nextRepoDay = d.greekName;
          }
        }
      }

      return {
        worker,
        totalHours: Math.round(totalHours * 10) / 10,
        shiftCount,
        morningCount,
        afternoonCount,
        nightCount,
        repoCount,
        extraHours: Math.round(extraHours * 10) / 10,
        nextRepoDay: nextRepoDay || 'Σαββατοκύριακο',
      };
    });
  }, [workerMembers, weekDays, todayStr, holidays]);

  const totalFamilyWorkHours = useMemo(() => {
    return allWorkersStats.reduce((acc, curr) => acc + curr.totalHours, 0);
  }, [allWorkersStats]);

  // Computed stats for all students
  const allStudentsStats = useMemo(() => {
    return studentMembers.map((student) => {
      const isKindergarten = student.studentData?.schoolLevel === 'kindergarten';
      const className = student.studentData?.className || (isKindergarten ? 'Νηπιαγωγείο' : "Β' Δημοτικού");
      const departureTime = student.studentData?.departureTime || (isKindergarten ? '13:00' : '14:55');
      const schoolHours = `08:15 - ${departureTime}`;
      const activitiesCount = student.studentData?.afternoonActivities?.length || 0;
      const tasks = student.studentData?.tasks || [];
      const pendingTasks = tasks.filter((t) => !t.completed).length;
      const isAllDay = !isKindergarten && Boolean(
        student.studentData?.showAllDay || (departureTime && departureTime > '13:15') || student.studentData?.departureNote?.includes('Ολοήμερο')
      );

      return {
        student,
        className,
        isKindergarten,
        isAllDay,
        schoolHours,
        activitiesCount,
        pendingTasks,
      };
    });
  }, [studentMembers]);

  const totalStudentActivities = useMemo(() => {
    return allStudentsStats.reduce((acc, curr) => acc + curr.activitiesCount, 0);
  }, [allStudentsStats]);

  // Student tasks count (all students)
  const studentTasks = useMemo(() => {
    const allTasks: { task: HomeworkTask; studentName: string; studentId: string; subjectName?: string }[] = [];
    for (const st of studentMembers) {
      const subjMap = new Map(st.studentData?.subjects?.map((s) => [s.id, s.name]) || []);
      if (st.studentData?.tasks) {
        for (const t of st.studentData.tasks) {
          allTasks.push({
            task: t,
            studentName: st.name,
            studentId: st.id,
            subjectName: t.subjectId ? subjMap.get(t.subjectId) : undefined,
          });
        }
      }
    }
    const completed = allTasks.filter((item) => item.task.completed).length;
    const total = allTasks.length;
    return { all: allTasks, completed, total, pending: total - completed };
  }, [studentMembers]);

  // Interactive Task Toggle
  const handleToggleTask = (studentId: string, taskId: string) => {
    const student = members.find((m) => m.id === studentId);
    if (!student || !student.studentData || !onUpdateMember) return;

    const taskToToggle = student.studentData.tasks.find((t) => t.id === taskId);
    const willBeCompleted = taskToToggle ? !taskToToggle.completed : false;

    if (willBeCompleted) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    }

    const updatedTasks = student.studentData.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    onUpdateMember({
      ...student,
      studentData: {
        ...student.studentData,
        tasks: updatedTasks,
      },
    });
  };

  // Add Family Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !onUpdateFamilyNotes) return;

    const newNote: FamilyNote = {
      id: 'note-' + Date.now(),
      title: newNoteTitle.trim(),
      text: newNoteText.trim(),
      tag: newNoteTag,
      date: todayStr,
    };

    onUpdateFamilyNotes([newNote, ...familyNotes]);
    setNewNoteTitle('');
    setNewNoteText('');
    setIsAddingNote(false);
  };

  // Delete Family Note
  const handleDeleteNote = (id: string) => {
    if (!onUpdateFamilyNotes) return;
    onUpdateFamilyNotes(familyNotes.filter((n) => n.id !== id));
  };

  // Compute Today's Chronological Vertical Timeline Events
  const todayTimelineEvents = useMemo(() => {
    const events: {
      time: string;
      title: string;
      subtitle: string;
      status: 'completed' | 'active' | 'next' | 'upcoming';
      badge: string;
      color: string;
    }[] = [];

    // Helper to find available driver(s) at any given time string "HH:mm"
    const getAvailableDrivers = (timeStr: string): string[] => {
      return workerMembers
        .filter((w) => {
          const shift = w.workerData?.shifts?.[todayStr];
          if (!shift || shift.type === 'REPO' || shift.type === 'ADEIA' || shift.type === 'ARGIA') return true;
          if (shift.type === 'WORK') {
            const start = shift.startTime || '09:00';
            const end = getFullEndTime(shift.endTime || '17:00', shift.extraHours);
            return timeStr < start || timeStr >= end;
          }
          return true;
        })
        .map((w) => w.name);
    };

    const isWeekend = todayLogistics.isSaturday || todayLogistics.isSunday || todayLogistics.isHoliday;

    if (!isWeekend) {
      // 1. Morning School Departure
      events.push({
        time: '07:45 - 08:10',
        title: 'Αναχώρηση για Σχολείο & Νηπιαγωγείο',
        subtitle: 'Πρωινό ξύπνημα, προετοιμασία τσάντας & μετακίνηση',
        status: 'completed',
        badge: 'Πρωινό',
        color: '#64748b',
      });
    }

    let anyStudentInAllDay = false;
    let anyStudentAtHomeForLunch = false;
    const homeLunchNames: string[] = [];

    // 2. Student School & All-Day Programs
    for (const student of studentMembers) {
      const stData = student.studentData;
      const isKindergarten = stData?.schoolLevel === 'kindergarten';
      if (isWeekend) continue;

      const departureTime = stData?.departureTime;
      const departureNote = stData?.departureNote;
      const showAllDay = Boolean(stData?.showAllDay);
      const isAllDay = !isKindergarten && Boolean(
        showAllDay || (departureTime && departureTime > '13:15') || departureNote?.includes('Ολοήμερο')
      );

      if (isKindergarten) {
        const kEnd = departureTime || '13:00';
        anyStudentAtHomeForLunch = true;
        homeLunchNames.push(student.name);

        events.push({
          time: `08:15 - ${kEnd}`,
          title: `🧸 Νηπιαγωγείο (${student.name})`,
          subtitle: `${stData?.schoolName || '23ο Νηπιαγωγείο'} • ${stData?.className || 'Ενιαίο Τμήμα'} (Σχόλασμα ${kEnd})`,
          status: 'completed',
          badge: 'Νηπιαγωγείο',
          color: '#3b82f6',
        });
      } else {
        // Primary / Lyceum / Gymnasium
        const dayIdx = new Date(todayDate).getDay();
        const greekDayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIdx];
        const daySlots = stData?.schedule?.filter((s) => s.day === greekDayKey) || [];
        const subjectsMap = new Map(stData?.subjects?.map((sub) => [sub.id, sub.name]));
        const subjectNames = daySlots
          .map((s) => s.subjectId ? subjectsMap.get(s.subjectId) : undefined)
          .filter((n): n is string => Boolean(n));
        const subjectsSummary = subjectNames.length > 0 ? subjectNames.slice(0, 4).join(', ') : 'Ωρολόγιο πρόγραμμα 6 ωρών';

        if (isAllDay) {
          anyStudentInAllDay = true;
          const actualDeparture = departureTime || '14:55';
          const allDayDrivers = getAvailableDrivers(actualDeparture);
          const driverInfo = allDayDrivers.length > 0 ? `Παραλαβή: ${allDayDrivers.join(', ')}` : '⚠️ Όλοι οι γονείς εργάζονται';

          // 1. Regular school hours (08:15 - 13:15)
          events.push({
            time: '08:15 - 13:15',
            title: `🎒 Μαθήματα Δημοτικού (${student.name})`,
            subtitle: `${stData?.schoolName || '11ο Δημοτικό'} (${stData?.className || 'Β1'}) • ${subjectsSummary}`,
            status: 'completed',
            badge: 'Δημοτικό',
            color: '#10b981',
          });

          // 2. All-Day Program (13:15 - departureTime) - Concise start and end
          events.push({
            time: `13:15 - ${actualDeparture}`,
            title: `☀️ Ολοήμερο Πρόγραμμα (${student.name})`,
            subtitle: `Σίτιση & Μελέτη • ${departureNote || '1η Ζώνη'} (Σχόλασμα ${actualDeparture}) • ${driverInfo}`,
            status: 'active',
            badge: 'Ολοήμερο',
            color: '#f59e0b',
          });
        } else {
          // Standard Primary school without All-Day
          anyStudentAtHomeForLunch = true;
          homeLunchNames.push(student.name);
          const endSchool = departureTime || '13:15';
          const normDrivers = getAvailableDrivers(endSchool);
          const driverInfo = normDrivers.length > 0 ? `Παραλαβή: ${normDrivers.join(', ')}` : '⚠️ Όλοι οι γονείς εργάζονται';

          events.push({
            time: `08:15 - ${endSchool}`,
            title: `🎒 Μαθήματα Σχολείου (${student.name})`,
            subtitle: `${stData?.schoolName || 'Δημοτικό'} (${stData?.className || ''}) • ${subjectsSummary} • Σχόλασμα ${endSchool} (${driverInfo})`,
            status: 'completed',
            badge: 'Σχολείο',
            color: '#10b981',
          });
        }
      }
    }

    // 3. Worker Shifts
    for (const worker of workerMembers) {
      const shift = worker.workerData?.shifts?.[todayStr];
      if (shift && shift.type === 'WORK') {
        const start = shift.startTime || '09:00';
        const end = getFullEndTime(shift.endTime || '17:00', shift.extraHours);
        const extraSuffix = shift.extraHours && shift.extraHours > 0 ? ` • +${shift.extraHours}h υπερ.` : '';
        events.push({
          time: `${start} - ${end}`,
          title: `💼 Βάρδια Εργασίας (${worker.name})`,
          subtitle: `${worker.workerData?.jobTitle || shift.notes || 'Εργασιακό ωράριο & καθήκοντα'}${
            shift.isOvernight ? ' (Νυχτερινό)' : ''
          }${extraSuffix}`,
          status: 'next',
          badge: shift.extraHours && shift.extraHours > 0 ? `+${shift.extraHours}h υπερ.` : 'Βάρδια',
          color: '#0ea5e9',
        });
      } else if (shift && shift.type === 'REPO') {
        events.push({
          time: '09:00',
          title: `🛋️ Ρεπό (${worker.name})`,
          subtitle: 'Ημέρα ανάπαυσης & ελεύθερος χρόνος για δουλειές σπιτιού',
          status: 'active',
          badge: 'Ρεπό',
          color: '#14b8a6',
        });
      } else if (shift && (shift.type === 'ADEIA' || shift.type === 'ARGIA')) {
        events.push({
          time: '09:00',
          title: `🏖️ Άδεια (${worker.name})`,
          subtitle: shift.type === 'ARGIA' ? 'Επίσημη αργία' : 'Κανονική άδεια',
          status: 'active',
          badge: 'Άδεια',
          color: '#10b981',
        });
      }
    }

    // 4. Midday Lunch at Home (only if not weekend)
    if (!isWeekend) {
      if (anyStudentInAllDay) {
        if (anyStudentAtHomeForLunch) {
          events.push({
            time: '13:15 - 14:00',
            title: `🍽️ Μεσημεριανό στο Σπίτι (${homeLunchNames.join(', ')} & γονείς)`,
            subtitle: 'Ο Γιώργος σιτίζεται στην τραπεζαρία του Ολοημέρου (13:20 - 14:00)',
            status: 'active',
            badge: 'Στο Σπίτι',
            color: '#6366f1',
          });
        } else {
          events.push({
            time: '13:30 - 14:15',
            title: '🍽️ Μεσημεριανό στο Σπίτι (Γονείς)',
            subtitle: 'Τα παιδιά σιτίζονται στο Ολοήμερο του σχολείου',
            status: 'active',
            badge: 'Στο Σπίτι',
            color: '#6366f1',
          });
        }
      } else {
        events.push({
          time: '14:00 - 14:45',
          title: '🍽️ Μεσημεριανό στο Σπίτι',
          subtitle: 'Οικογενειακό μεσημεριανό γεύμα & ξεκούραση',
          status: 'active',
          badge: 'Στο Σπίτι',
          color: '#6366f1',
        });
      }
    }

    // 5. Student Afternoon Activities
    const dayIdx = new Date(todayDate).getDay();
    const greekDayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIdx];

    for (const student of studentMembers) {
      const activities =
        student.studentData?.afternoonActivities?.filter((a) => a.days?.includes(greekDayKey as any)) || [];
      for (const act of activities) {
        const actDrivers = getAvailableDrivers(act.startTime);
        events.push({
          time: `${act.startTime} - ${act.endTime}`,
          title: `${act.icon || '⭐'} ${act.name} (${student.name})`,
          subtitle: `${act.location ? `Τοποθεσία: ${act.location}` : 'Εξωσχολική δραστηριότητα'}${
            actDrivers.length > 0 ? ` • Συνοδεία: ${actDrivers.join(', ')}` : ' • ⚠️ Όλοι οι γονείς εργάζονται'
          }`,
          status: 'upcoming',
          badge: 'Δραστηριότητα',
          color: act.color || '#f59e0b',
        });
      }
    }

    // 6. Evening Study & Family Dinner
    events.push({
      time: '20:00 - 21:30',
      title: '🌙 Μελέτη & Οικογενειακό Δείπνο',
      subtitle: 'Έλεγχος αυριανής τσάντας, προετοιμασία & οικογενειακή χαλάρωση',
      status: 'upcoming',
      badge: 'Χαλάρωση',
      color: '#8b5cf6',
    });

    // 7. Chronological Sort (strict by event start time)
    const parseTimeMinutes = (timeStr: string): number => {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (!match) return 9999;
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    };

    events.sort((a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time));

    // 8. Dynamic Real-Time Status Computation
    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();

    for (const evt of events) {
      const startMatch = evt.time.match(/^(\d{1,2}):(\d{2})/);
      const endMatch = evt.time.match(/-\s*(\d{1,2}):(\d{2})/);
      if (startMatch) {
        const startMin = parseInt(startMatch[1], 10) * 60 + parseInt(startMatch[2], 10);
        const endMin = endMatch
          ? parseInt(endMatch[1], 10) * 60 + parseInt(endMatch[2], 10)
          : startMin + 20;

        if (curMin >= endMin) {
          evt.status = 'completed';
        } else if (curMin >= startMin && curMin < endMin) {
          evt.status = 'active';
        } else {
          evt.status = 'upcoming';
        }
      }
    }

    return events;
  }, [todayLogistics, members, todayStr, workerMembers, studentMembers, todayDate]);

  // Next Transit Widget Data
  const nextTransit = useMemo(() => {
    const studentCommitments = todayLogistics.commitments.filter((c) => c.memberRole === 'student');
    const workerCommitments = todayLogistics.commitments.filter((c) => c.memberRole === 'worker');

    interface TransitItem {
      time: string;
      timeMinutes: number;
      title: string;
      subtitle: string;
      driver: string;
      isWarning: boolean;
    }

    const transits: TransitItem[] = [];
    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();

    const getDriversForTime = (timeStr: string) => {
      return workerCommitments.filter((w) => {
        if (w.statusBadgeType === 'repo' || w.statusBadgeType === 'leave') return true;
        const workWin = w.busyWindows.find((b) => b.type === 'work');
        if (!workWin) return true;
        return timeStr < workWin.start || timeStr >= workWin.end;
      });
    };

    // 1. School Finish Pickups
    for (const st of studentCommitments) {
      const schoolWin = st.busyWindows.find((b) => b.type === 'school');
      if (schoolWin) {
        const finishTime = schoolWin.end;
        const match = finishTime.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          const tMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
          const drivers = getDriversForTime(finishTime);
          const isWarn = drivers.length === 0 && workerCommitments.length > 0;
          transits.push({
            time: `${finishTime}`,
            timeMinutes: tMin,
            title: `Παραλαβή ${st.memberName}: ${schoolWin.title}`,
            subtitle: `Σχόλασμα στις ${finishTime}`,
            driver: isWarn ? '⚠️ Επικάλυψη: Όλοι εργάζονται' : `Οδηγός: ${drivers.map((d) => d.memberName).join(', ')}`,
            isWarning: isWarn,
          });
        }
      }
    }

    // 2. Afternoon Activities
    for (const st of studentCommitments) {
      if (st.details.activities) {
        for (const act of st.details.activities) {
          const match = act.startTime.match(/(\d{1,2}):(\d{2})/);
          if (match) {
            const tMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
            const drivers = getDriversForTime(act.startTime);
            const isWarn = drivers.length === 0 && workerCommitments.length > 0;
            transits.push({
              time: `${act.startTime}`,
              timeMinutes: tMin,
              title: `Μετακίνηση ${st.memberName}: ${act.name}`,
              subtitle: `${act.location || 'Χώρος δραστηριότητας'} • Λήξη στις ${act.endTime}`,
              driver: isWarn ? '⚠️ Επικάλυψη: Όλοι εργάζονται' : `Οδηγός: ${drivers.map((d) => d.memberName).join(', ')}`,
              isWarning: isWarn,
            });
          }
        }
      }
    }

    // Sort all candidate transits
    transits.sort((a, b) => a.timeMinutes - b.timeMinutes);

    // Pick first upcoming transit
    const upcoming = transits.find((t) => t.timeMinutes >= curMin);
    if (upcoming) {
      return upcoming;
    }

    // If there are transits today but all have passed:
    if (transits.length > 0) {
      const last = transits[transits.length - 1];
      return {
        title: 'Όλες οι μετακινήσεις ολοκληρώθηκαν',
        subtitle: `Τελευταία μετακίνηση: ${last.title} (${last.time})`,
        time: 'Ολοκληρώθηκε',
        driver: 'Όλα έτοιμα',
        isWarning: false,
      };
    }

    return {
      title: 'Δεν υπάρχουν εκκρεμείς μετακινήσεις',
      subtitle: 'Όλες οι μετακινήσεις της ημέρας είναι τακτοποιημένες',
      time: 'Ελεύθερο',
      driver: 'Όλα έτοιμα',
      isWarning: false,
    };
  }, [todayLogistics]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP BENTO QUICK STATS ROW (Stitch Executive Dashboard Style)           */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 no-print">
        {/* Widget 1: Today Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xs dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Σύνοψη Εργασιών / Overview</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold font-mono">
              {todayLogistics.dayNameGreek}
            </span>
          </div>

          <div className="space-y-1.5 mt-3 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
            {todayLogistics.commitments.map((c) => {
              const isWorker = c.memberRole === 'worker';
              const isRepo = c.statusBadgeType === 'repo';

              // Concise extra note / activity for the single line
              const extraNote = isWorker
                ? c.details.workerShift?.notes
                : c.details.activities?.[0]?.name
                ? `(${c.details.activities[0].name})`
                : c.details.schoolLevel === 'kindergarten'
                ? '(Νηπιαγωγείο)'
                : '';

              const workerExtraHours = isWorker ? (c.details.workerShift?.extraHours || 0) : 0;

              // Single-line time / status badge
              const timeDisplay = isRepo
                ? 'Ρεπό'
                : isWorker
                ? (c.details.workerShift?.startTime && c.details.workerShift?.endTime
                    ? `${c.details.workerShift.startTime} - ${getFullEndTime(c.details.workerShift.endTime, c.details.workerShift.extraHours)}`
                    : c.primaryStatus)
                : (c.details.departureTime
                    ? `08:15 - ${c.details.departureTime}`
                    : c.primaryStatus.replace(/^(Σχολείο & Ολοήμερο|Σχολείο|Νηπιαγωγείο)\s*/, ''));

              return (
                <div
                  key={c.memberId}
                  className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
                    isWorker
                      ? isRepo
                        ? 'bg-teal-50/80 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/40 text-teal-900 dark:text-teal-200'
                        : 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200'
                      : 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.memberColor || (isWorker ? '#3b82f6' : '#10b981') }}
                    />
                    <span className="text-xs shrink-0">{c.memberAvatar}</span>
                    <span className="font-bold shrink-0 text-[11px] text-slate-800 dark:text-slate-200">
                      {c.memberName}
                    </span>
                    {extraNote && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate opacity-80">
                        {extraNote}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-semibold shrink-0 px-1.5 py-0.5 rounded border ${
                        isRepo
                          ? 'bg-teal-100/70 dark:bg-teal-900/40 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
                          : isWorker
                          ? 'bg-blue-100/70 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {timeDisplay}
                    </span>
                    {workerExtraHours > 0 && (
                      <span className="text-[9px] font-semibold rounded bg-amber-100 dark:bg-amber-950/80 px-1 py-0.2 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/70">
                        +{workerExtraHours}h υπερ.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget 2: Next Transit & Logistics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xs dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Επόμενη Μετακίνηση</span>
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono border ${
                nextTransit.isWarning
                  ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
              }`}
            >
              {nextTransit.time}
            </span>
          </div>
          <div className="mt-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{nextTransit.title}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{nextTransit.subtitle}</p>
            <div className="mt-2.5 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{nextTransit.time}</span>
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-300 font-semibold flex items-center gap-1 truncate">
                <User className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span className="truncate">{nextTransit.driver}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Widget 3: Pending Homework & Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xs dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Εκκρεμότητες / Tasks</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-bold font-mono">
              {studentTasks.total} Σύνολο
            </span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {studentTasks.completed} / {studentTasks.total}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">ολοκληρωμένα</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {studentTasks.pending > 0
                ? `⚡ ${studentTasks.pending} καθήκοντα σε εκκρεμότητα για αύριο`
                : '🎉 Όλα τα καθήκοντα ολοκληρώθηκαν!'}
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: studentTasks.total > 0 ? `${(studentTasks.completed / studentTasks.total) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Widget 4: Family Sync Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xs dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Συγχρονισμός / Status</span>
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div className="mt-2 space-y-1.5 text-xs max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
            {members.map((m) => {
              const commitment = todayLogistics.commitments.find((c) => c.memberId === m.id);
              const isWorker = m.role === 'worker';
              const roleTitle = isWorker
                ? (m.workerData?.jobTitle ? `${m.workerData.jobTitle}` : 'Βάρδιες')
                : (m.studentData?.schoolLevel === 'kindergarten'
                    ? 'Νηπιαγωγείο'
                    : (m.studentData?.showAllDay || (m.studentData?.departureTime && m.studentData.departureTime > '13:15'))
                      ? 'Δημοτικό & Ολοήμερο'
                      : 'Δημοτικό');

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate text-[11px]">
                    <span className="text-sm shrink-0">{m.avatar || (isWorker ? '💼' : '🎒')}</span>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="font-semibold truncate">{m.name}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] shrink-0 truncate">({roleTitle})</span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {commitment && commitment.statusBadgeType === 'work' && commitment.primaryStatus && (
                      <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/50">
                        {commitment.primaryStatus.split(' ')[0]}
                      </span>
                    )}
                    {commitment && commitment.statusBadgeType === 'repo' && (
                      <span className="text-[10px] font-mono font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-900/50">
                        Ρεπό
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span className="truncate">{members.length} συνδεδεμένα μέλη</span>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer shrink-0 ml-1"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Ανανέωση</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN SPLIT: CENTRAL PLAN (8 cols) & RIGHT TIMELINE/NOTES (4 cols)      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ==================== LEFT / CENTRAL MAIN PANEL ======================== */}
        <div className="xl:col-span-8 flex flex-col gap-6 print:xl:col-span-12 print:w-full">
          {/* Main Weekly Schedule Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs dark:shadow-xl space-y-4 print:border-none print:shadow-none print:p-0">
            {/* Printable Header (Compact for single-page print) */}
            <div className="print-only pb-1 mb-1 border-b border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">
                    🏠 Οικογένεια Μίλκου — Κοινό Εβδομαδιαίο Πρόγραμμα
                  </h1>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    Εβδομάδα {activeWeekNumber} • {firstDayStr} έως {lastDayStr}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">
                  HouseSchedule • {selectedMemberFilter === 'all' ? 'Όλα τα Μέλη' : (members.find((m) => m.id === selectedMemberFilter)?.name || '')}
                </div>
              </div>
            </div>

            {/* Header: Title, Week Badge & Member Filter Controls (Screen Only) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 no-print">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Εβδομαδιαίο Πρόγραμμα / Schedule</span>
                  </h3>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 px-2 py-0.5 rounded-full font-mono font-bold">
                    Εβδομάδα {activeWeekNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  {firstDayStr} έως {lastDayStr} • Συγχρονισμός Βαρδιών & Σχολείου
                </p>
              </div>

              {/* Member Filters & Week Nav Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Member Filter Pills */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedMemberFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      selectedMemberFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Όλοι
                  </button>
                  {members.map((m) => {
                    const isSelected = selectedMemberFilter === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMemberFilter(m.id)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Week Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Προηγούμενη εβδομάδα"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleTodayWeek}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    Σήμερα
                  </button>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Επόμενη εβδομάδα"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Legend & Collision Warning (Screen Only) */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-xs border-b border-slate-100 dark:border-slate-800/80 no-print">
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Υπόμνημα:</span>
                <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                  <span>Βάρδια Εργασίας</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span>Σχολείο</span>
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span>Δραστηριότητες / Sports</span>
                </span>
                <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400" />
                  <span>Φροντιστήριο</span>
                </span>
              </div>

              {weeklyWarnings.length > 0 && (
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-2.5 py-1 rounded-lg text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                  <span>{weeklyWarnings[0].message}</span>
                </div>
              )}
            </div>

            {/* 7-DAY GRID (Or Timeline View) */}
            {viewLayout === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 print:grid-cols-7 print:gap-1.5">
                {weekLogistics.map((dayLog) => {
                  const isToday = dayLog.date === todayStr;
                  const filteredCommitments =
                    selectedMemberFilter === 'all'
                      ? dayLog.commitments
                      : dayLog.commitments.filter((c) => c.memberId === selectedMemberFilter);

                  return (
                    <div
                      key={dayLog.date}
                      className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs dark:shadow-md ${
                        isToday
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-2 border-indigo-400 dark:border-indigo-500/60 shadow-indigo-500/10'
                          : dayLog.isSunday || dayLog.isSaturday
                          ? 'bg-slate-100/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80'
                          : 'bg-slate-50/90 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800/80'
                      }`}
                    >
                      {/* Day Header */}
                      <div
                        onClick={() => setSelectedDayModal(dayLog.date)}
                        className={`px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors ${
                          isToday ? 'bg-indigo-100/60 dark:bg-indigo-500/15' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isToday ? 'text-indigo-900 dark:text-indigo-300 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                              {dayLog.dayNameGreek.slice(0, 3)} {dayLog.date.slice(8)}
                            </span>
                            {isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{dayLog.date.slice(5)}</span>
                        </div>

                        {isToday ? (
                          <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded font-mono print:hidden">
                            ΣΗΜΕΡΑ
                          </span>
                        ) : dayLog.holidayName ? (
                          <span
                            className="text-[9px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 px-1 py-0.2 rounded truncate max-w-[60px]"
                            title={dayLog.holidayName}
                          >
                            Αργία
                          </span>
                        ) : null}
                      </div>

                      {/* Day Cards for commitments */}
                      <div className="p-2 space-y-2 flex-1">
                        {filteredCommitments.map((c) => {
                          const isWorker = c.memberRole === 'worker';
                          const isRepo = c.statusBadgeType === 'repo';
                          const isWork = c.statusBadgeType === 'work';

                          return (
                            <div
                              key={c.memberId}
                              onClick={() => {
                                if (isWorker && onQuickEditShift) {
                                  onQuickEditShift(c.memberId, dayLog.date);
                                } else if (onSelectMember) {
                                  onSelectMember(c.memberId);
                                }
                              }}
                              className={`rounded-xl p-2 border text-[11px] space-y-1 transition-all cursor-pointer group hover:scale-[1.01] shadow-xs dark:shadow-none ${
                                isWork
                                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 border-l-4 border-l-blue-500'
                                  : isRepo
                                  ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/30 border-l-4 border-l-teal-500'
                                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 border-l-4 border-l-emerald-500'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold truncate text-slate-800 dark:text-slate-200" style={{ color: c.memberColor }}>
                                  {c.memberName}
                                </span>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                                  {isWorker ? 'Βάρδια' : 'Σχολείο'}
                                </span>
                              </div>

                              <div className="font-semibold text-slate-900 dark:text-slate-100 text-[10px] truncate">
                                {c.primaryStatus}
                              </div>
                              {isWorker && c.details.workerShift?.extraHours && c.details.workerShift.extraHours > 0 ? (
                                <div className="flex items-center gap-1 text-[9px]">
                                  <span className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 font-semibold text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                                    +{c.details.workerShift.extraHours}h υπερ.
                                  </span>
                                </div>
                              ) : null}

                              {/* Afternoon Activities */}
                              {!isWorker && c.details.activities && c.details.activities.length > 0 && (
                                <div className="pt-1 border-t border-slate-200/80 dark:border-slate-800/60 space-y-1">
                                  {c.details.activities.map((act) => (
                                    <div
                                      key={act.id}
                                      className="p-1 rounded bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[9px] flex items-center justify-between text-amber-700 dark:text-amber-300 shadow-xs dark:shadow-none"
                                    >
                                      <span className="truncate flex items-center gap-1">
                                        <span>{act.icon}</span>
                                        <span className="truncate text-slate-800 dark:text-slate-200 font-medium">{act.name}</span>
                                      </span>
                                      <span className="font-mono text-amber-600 dark:text-amber-400 shrink-0 font-semibold">{act.startTime}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Day Card Footer */}
                      <div
                        onClick={() => setSelectedDayModal(dayLog.date)}
                        className="px-2.5 py-1 bg-slate-100/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between cursor-pointer hover:text-indigo-600 dark:hover:text-amber-400 transition-colors no-print"
                      >
                        <span className="flex items-center gap-1 truncate">
                          <Car className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>Logistics</span>
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-amber-400">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM BENTO GRID: SHIFT SUMMARY & SCHOOL STATS                           */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
            {/* Box 1: Worker Shift Summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs dark:shadow-xl">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Σύνοψη Βαρδιών Εργασίας (Εβδομάδα)</span>
                  </span>
                  <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono font-bold">
                    {totalFamilyWorkHours} ώρες σύνολο
                  </span>
                </div>

                <div className="space-y-2">
                  {allWorkersStats.map(({ worker, totalHours, shiftCount, repoCount, extraHours, nextRepoDay }) => (
                    <div
                      key={worker.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{worker.avatar || '💼'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                              {worker.name}
                            </span>
                            {worker.workerData?.jobTitle && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">
                                ({worker.workerData.jobTitle})
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {shiftCount} βάρδιες
                            {repoCount > 0 ? ` • ${repoCount} ρεπό` : ''}
                            {nextRepoDay && nextRepoDay !== 'Κανένα' ? ` (Επόμενο: ${nextRepoDay})` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {extraHours > 0 && (
                          <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                            +{extraHours}h
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/50">
                          {totalHours} ώρες
                        </span>
                        {onSelectMember && (
                          <button
                            type="button"
                            onClick={() => onSelectMember(worker.id)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            title={`Αναλυτικό Ημερολόγιο (${worker.name})`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Διαχείριση βαρδιών & ρεπό</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  Κλικ στο βελάκι για αναλυτικό πλάνο
                </span>
              </div>
            </div>

            {/* Box 2: Student School & Extracurriculars */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs dark:shadow-xl">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>Πρόγραμμα & Δραστηριότητες (Εβδομάδα)</span>
                  </span>
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {totalStudentActivities} εξωσχολικές δραστηριότητες
                  </span>
                </div>

                <div className="space-y-2">
                  {allStudentsStats.map(({ student, className, isAllDay, isKindergarten, schoolHours, activitiesCount }) => {
                    const programDesc = isKindergarten
                      ? 'Ενιαίο Τμήμα Νηπιαγωγείου'
                      : isAllDay
                      ? 'Δημοτικό & Ολοήμερο'
                      : 'Δημοτικό Πρόγραμμα';

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{student.avatar || '🎒'}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 shrink-0">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">
                                ({className})
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                              {programDesc}
                              {activitiesCount > 0 ? ` • ${activitiesCount} δραστηριότητες` : ' • Χωρίς εξωσχολικά'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {activitiesCount > 0 && (
                            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                              {activitiesCount} δραστ.
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {schoolHours}
                          </span>
                          {onSelectMember && (
                            <button
                              type="button"
                              onClick={() => onSelectMember(student.id)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                              title={`Αναλυτικό Πρόγραμμα (${student.name})`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Ωρολόγιο μαθημάτων & καθήκοντα</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  Κλικ στο βελάκι για αναλυτικό πλάνο
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT PANEL (32% width on XL) ===================== */}
        <div className="xl:col-span-4 flex flex-col gap-6 no-print">
          {/* 1. Today's Detailed Vertical Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Σημερινό Πρόγραμμα / Timeline</h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
                {todayLogistics.dayNameGreek} {todayStr.slice(8)}/{todayStr.slice(5, 7)}
              </span>
            </div>

            {/* Vertical Chronological Line */}
            <div className="relative pl-6 space-y-4 mt-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {todayTimelineEvents.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <span
                    className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform group-hover:scale-125 ${
                      evt.status === 'active' ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                    }`}
                    style={{ backgroundColor: evt.color }}
                  />
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-xs font-bold font-mono ${
                        evt.status === 'active'
                          ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {evt.time}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold"
                      style={{
                        backgroundColor: `${evt.color}20`,
                        color: evt.color,
                        borderColor: `${evt.color}40`,
                        borderWidth: '1px',
                      }}
                    >
                      {evt.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{evt.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{evt.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Interactive Tasks Checklist (Giorgos) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Καθήκοντα {studentMembers.length > 1 ? 'Μαθητών' : (activeStudent?.name || 'Μαθητή')}
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {studentTasks.completed}/{studentTasks.total} Έτοιμα
              </span>
            </div>

            <div className="space-y-2 mt-4">
              {studentTasks.all.length > 0 ? (
                studentTasks.all.slice(0, 5).map(({ task, studentId, subjectName }) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(studentId, task.id)}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-0.5">
                        {subjectName && (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {subjectName}
                          </span>
                        )}
                        {task.dueDate && <span>• Έως {task.dueDate}</span>}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Δεν υπάρχουν καταγεγραμμένα καθήκοντα.
                </div>
              )}
            </div>

            {activeStudent && onSelectMember && (
              <button
                type="button"
                onClick={() => onSelectMember(activeStudent.id)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Διαχείριση Εργασιών ({activeStudent.name})</span>
              </button>
            )}
          </div>

          {/* 3. Family Notes / Sticky Notes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Σημειώσεις Σπιτιού / Notes</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Νέα</span>
              </button>
            </div>

            {/* Inline Add Note Form */}
            {isAddingNote && (
              <form onSubmit={handleAddNote} className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <input
                  type="text"
                  required
                  placeholder="Τίτλος σημείωσης (π.χ. Υλικά ζωγραφικής)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <textarea
                  rows={2}
                  placeholder="Κείμενο σημείωσης..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <select
                    value={newNoteTag}
                    onChange={(e) => setNewNoteTag(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-300 rounded-lg px-2 py-1"
                  >
                    <option value="Σχολείο">Σχολείο</option>
                    <option value="Αθλητισμός">Αθλητισμός</option>
                    <option value="Σπίτι">Σπίτι</option>
                    <option value="Επείγον">Επείγον</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-400 text-xs font-semibold"
                    >
                      Άκυρο
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm"
                    >
                      Αποθήκευση
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-2 mt-4">
              {familyNotes.length > 0 ? (
                familyNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-amber-300">{note.title}</span>
                      <div className="flex items-center gap-1.5">
                        {note.tag && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                            {note.tag}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-0.5 rounded transition-all"
                          title="Διαγραφή σημείωσης"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {note.text && <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{note.text}</p>}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  Δεν υπάρχουν οικογενειακές σημειώσεις. Πατήστε «+ Νέα» για προσθήκη!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DAILY INSPECTOR & LOGISTICS MODAL                                      */}
      {/* ========================================================================= */}
      {selectedDayModal && activeDaySummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs sm:backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Ανάλυση Ημέρας: {activeDaySummary.dayNameGreek}</span>
                  <span className="font-mono text-sm text-slate-500 dark:text-slate-400">({activeDaySummary.date})</span>
                </h3>
                {activeDaySummary.holidayName && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                    Επίσημη Αργία: {activeDaySummary.holidayName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedDayModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Logistics & Ride Insights */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Logistics & Μετακινήσεις (Ride Assistant)</span>
              </h4>
              <div className="space-y-1.5">
                {activeDaySummary.logisticsNotes.map((note, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      note.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                        : note.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                        : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {note.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    ) : note.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Car className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    )}
                    <span>{note.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitments breakdown */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Αναλυτικό Πρόγραμμα ανά Μέλος
              </h4>
              <div className="space-y-2.5">
                {activeDaySummary.commitments.map((c) => (
                  <div
                    key={c.memberId}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.memberAvatar}</span>
                        <span className="font-bold text-sm" style={{ color: c.memberColor }}>
                          {c.memberName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          ({c.memberRole === 'worker' ? 'Εργαζόμενος' : 'Μαθητής'})
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          {c.primaryStatus}
                        </span>
                        {c.memberRole === 'worker' && c.details.workerShift?.extraHours && c.details.workerShift.extraHours > 0 ? (
                          <span className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            +{c.details.workerShift.extraHours}h υπερ.
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {c.details.activities && c.details.activities.length > 0 && (
                      <div className="pl-6 space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Εξωσχολικές Δραστηριότητες:</p>
                        {c.details.activities.map((act) => (
                          <p key={act.id} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span>{act.icon}</span>
                            <span className="font-semibold">{act.name}</span>
                            <span className="text-amber-600 dark:text-amber-400 font-mono">({act.startTime} - {act.endTime})</span>
                            {act.location && <span className="text-slate-400 dark:text-slate-500">• {act.location}</span>}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedDayModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function householdMembersLabel(members: FamilyMember[]): string {
  if (!members || members.length === 0) return 'Οικογένεια';
  return members.map((m) => m.name).join(' & ');
}
