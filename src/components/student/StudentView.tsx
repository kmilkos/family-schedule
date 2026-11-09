import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  Calendar,
  CheckSquare,
  Activity,
  Plus,
  Clock,
  Sparkles,
  BookOpen,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FamilyMember, StudentData, ScheduleSlot, HomeworkTask, AfternoonActivity, DayOfWeek, Period, Profile, Subject } from '../../types';
import { KINDERGARTEN_ROUTINE, PRIMARY_PERIODS, PRIMARY_ALL_DAY_PERIODS, PRIMARY_SUBJECTS } from '../../data/studentPresets';
import { TimetableGrid } from './TimetableGrid';
import { HomeworkTracker } from './HomeworkTracker';
import { ActivityManagerModal } from './ActivityManagerModal';
import { CellEditModal } from './CellEditModal';
import { SubjectManagerModal } from './SubjectManagerModal';
import { PeriodManagerModal } from './PeriodManagerModal';

interface StudentViewProps {
  member: FamilyMember;
  onUpdateMember: (updated: FamilyMember) => void;
  onEditProfile?: () => void;
  onDeleteMember?: () => void;
  canDelete?: boolean;
}

export const StudentView: React.FC<StudentViewProps> = ({
  member,
  onUpdateMember,
  onEditProfile,
  onDeleteMember,
  canDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'homework' | 'activities'>('schedule');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [showMatrixForKindergarten, setShowMatrixForKindergarten] = useState(false);
  const [isPaletteExpanded, setIsPaletteExpanded] = useState(false);

  const handleOpenPeriodManager = (periodId?: number) => {
    setEditingPeriodId(periodId ?? null);
    setIsPeriodModalOpen(true);
  };
  const paletteRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const scrollPalette = (direction: 'left' | 'right') => {
    if (paletteRef.current) {
      paletteRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth',
      });
    }
  };

  const handlePaletteWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isPaletteExpanded || !paletteRef.current) return;
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaletteExpanded || !paletteRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - paletteRef.current.offsetLeft);
    setScrollLeftState(paletteRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !paletteRef.current) return;
    e.preventDefault();
    const x = e.pageX - paletteRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    paletteRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Cell Edit Modal state
  const [cellModalState, setCellModalState] = useState<{
    isOpen: boolean;
    day: DayOfWeek;
    period: Period | null;
    currentSlot?: ScheduleSlot;
  }>({
    isOpen: false,
    day: 'monday',
    period: null,
  });

  const student = member.studentData;
  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400">
        Δεν βρέθηκαν σχολικά δεδομένα για το μέλος {member.name}.
      </div>
    );
  }

  const updateStudentData = (partial: Partial<StudentData>) => {
    onUpdateMember({
      ...member,
      studentData: {
        ...student,
        ...partial,
      },
    });
  };

  const isPrimary = student.schoolLevel === 'primary';
  const isAllDayDeparture = Boolean(
    student.departureTime && student.departureTime > '13:15'
  );
  const showAllDay = student.showAllDay ?? isAllDayDeparture;

  const handleToggleAllDay = () => {
    updateStudentData({ showAllDay: !showAllDay });
  };

  // Ensure effective periods contain user periods or fallback to presets
  const effectivePeriods = React.useMemo(() => {
    if (student.periods && student.periods.length > 0) {
      return student.periods;
    }
    if (isPrimary) {
      return PRIMARY_PERIODS;
    }
    return student.periods || [];
  }, [isPrimary, student.periods]);

  // Ensure effective subjects contain user subjects or fallback to presets
  const effectiveSubjects = React.useMemo(() => {
    if (!student.subjects || student.subjects.length === 0) {
      return isPrimary ? PRIMARY_SUBJECTS : [];
    }
    return student.subjects;
  }, [isPrimary, student.subjects]);

  const handleSavePeriods = (updatedPeriods: Period[], deletedPeriodIds: number[] = []) => {
    let newSchedule = student.schedule;
    if (deletedPeriodIds && deletedPeriodIds.length > 0) {
      const deletedSet = new Set(deletedPeriodIds);
      newSchedule = student.schedule.filter((s) => !deletedSet.has(s.periodId));
    }
    updateStudentData({
      periods: updatedPeriods,
      schedule: newSchedule,
    });
  };

  const handleSaveSubjects = (updatedSubjects: Subject[], deletedSubjectIds: string[] = []) => {
    let newSchedule = student.schedule;
    if (deletedSubjectIds && deletedSubjectIds.length > 0) {
      const deletedSet = new Set(deletedSubjectIds);
      newSchedule = student.schedule.filter((s) => !s.subjectId || !deletedSet.has(s.subjectId));
      if (selectedSubjectId && deletedSet.has(selectedSubjectId)) {
        setSelectedSubjectId(null);
      }
    }
    updateStudentData({
      subjects: updatedSubjects,
      schedule: newSchedule,
    });
  };

  // Convert studentData into Profile-compatible object for existing components
  const profileCompatible: Profile = {
    id: member.id,
    name: member.name,
    schoolLevel: student.schoolLevel,
    className: student.className,
    schoolName: student.schoolName,
    schoolYear: student.schoolYear,
    showSaturday: student.showSaturday,
    showAllDay,
    departureTime: student.departureTime,
    departureNote: student.departureNote,
    periods: effectivePeriods,
    subjects: effectiveSubjects,
    schedule: student.schedule,
    tasks: student.tasks,
    afternoonActivities: student.afternoonActivities,
    updatedAt: new Date().toISOString(),
  };

  // Slot click handling: quick paint if subject is selected, or open edit modal
  const handleSlotClick = (day: DayOfWeek, period: Period) => {
    const existingSlot = student.schedule.find(
      (s) => s.day === day && s.periodId === period.id
    );

    if (selectedSubjectId) {
      // Quick Paint Mode
      if (existingSlot?.subjectId === selectedSubjectId) {
        // Clear if clicking again with same subject
        updateStudentData({
          schedule: student.schedule.filter(
            (s) => !(s.day === day && s.periodId === period.id)
          ),
        });
      } else {
        // Assign selected subject
        const updated = student.schedule.filter(
          (s) => !(s.day === day && s.periodId === period.id)
        );
        updated.push({
          day,
          periodId: period.id,
          subjectId: selectedSubjectId,
        });
        const subjObj = effectiveSubjects.find((s) => s.id === selectedSubjectId);
        const hasSubj = student.subjects.some((s) => s.id === selectedSubjectId);
        const newSubjects = (subjObj && !hasSubj) ? [...student.subjects, subjObj] : student.subjects;
        const newPeriods = (!student.periods.some((p) => p.id === period.id)) ? effectivePeriods : student.periods;
        updateStudentData({ schedule: updated, subjects: newSubjects, periods: newPeriods });
      }
    } else {
      // Open Detailed Modal
      setCellModalState({
        isOpen: true,
        day,
        period,
        currentSlot: existingSlot,
      });
    }
  };

  const handleOpenEditSlotModal = (day: DayOfWeek, period: Period) => {
    const existingSlot = student.schedule.find(
      (s) => s.day === day && s.periodId === period.id
    );
    setCellModalState({
      isOpen: true,
      day,
      period,
      currentSlot: existingSlot,
    });
  };

  const handleSaveModalSlot = (updatedSlot: ScheduleSlot | null) => {
    if (!cellModalState.period) return;
    const { day, period } = cellModalState;

    let newSchedule = student.schedule.filter(
      (s) => !(s.day === day && s.periodId === period.id)
    );

    let newSubjects = student.subjects;
    if (updatedSlot && updatedSlot.subjectId) {
      newSchedule.push(updatedSlot);
      const subjObj = effectiveSubjects.find((s) => s.id === updatedSlot.subjectId);
      const hasSubj = student.subjects.some((s) => s.id === updatedSlot.subjectId);
      if (subjObj && !hasSubj) {
        newSubjects = [...student.subjects, subjObj];
      }
    }

    const hasPeriod = student.periods.some((p) => p.id === period.id);
    const newPeriods = !hasPeriod ? effectivePeriods : student.periods;

    updateStudentData({ schedule: newSchedule, subjects: newSubjects, periods: newPeriods });
    setCellModalState({ isOpen: false, day: 'monday', period: null });
  };

  const handleClearSlot = (day: DayOfWeek, periodId: number) => {
    updateStudentData({
      schedule: student.schedule.filter(
        (s) => !(s.day === day && s.periodId === periodId)
      ),
    });
  };

  const handleToggleSaturday = () => {
    updateStudentData({ showSaturday: !student.showSaturday });
  };

  // Task Handlers
  const handleAddTask = (newTask: Omit<HomeworkTask, 'id' | 'createdAt'>) => {
    const task: HomeworkTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateStudentData({ tasks: [task, ...student.tasks] });
  };

  const handleToggleTask = (taskId: string) => {
    updateStudentData({
      tasks: student.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    updateStudentData({
      tasks: student.tasks.filter((t) => t.id !== taskId),
    });
  };

  // Activity Handlers
  const handleUpdateActivities = (newActivities: AfternoonActivity[]) => {
    updateStudentData({ afternoonActivities: newActivities });
  };

  const pendingTasksCount = student.tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6">
      {/* Top Profile Card (Screen only) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs dark:shadow-xl transition-colors no-print">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border shadow-xs dark:shadow-lg shrink-0"
            style={{ backgroundColor: `${member.color}20`, borderColor: member.color }}
          >
            {member.avatar || '🎒'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{member.name}</h2>
              
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                {student.schoolLevel === 'kindergarten'
                  ? '🧸 Νηπιαγωγείο'
                  : student.schoolLevel === 'primary'
                  ? '🎒 Δημοτικό'
                  : student.schoolLevel === 'gymnasium'
                  ? '📚 Γυμνάσιο'
                  : student.schoolLevel === 'lyceum'
                  ? '🎓 Λύκειο'
                  : 'Σχολείο'}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                {student.className || 'Τάξη'}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Σχόλασμα: {student.departureTime || (student.schoolLevel === 'kindergarten' ? '13:00' : '13:15')}
                  {student.departureNote ? ` (${student.departureNote})` : ''}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {student.schoolName || 'Σχολείο'} • {student.schoolYear || '2026-2027'}
            </p>
          </div>
        </div>

        {/* Sub-view Navigation Pills & Member Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                activeTab === 'schedule'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{student.schoolLevel === 'kindergarten' ? 'Καθημερινό Ωράριο' : 'Ωρολόγιο Πρόγραμμα'}</span>
            </button>

            <button
              onClick={() => setActiveTab('homework')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                activeTab === 'homework'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Καθήκοντα ({pendingTasksCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                activeTab === 'activities'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Δραστηριότητες ({student.afternoonActivities?.length || 0})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Διαχείριση Σχολικών Μαθημάτων"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Μαθήματα ({(effectiveSubjects.length ?? 0)})</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenPeriodManager()}
            className="px-2.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Διαχείριση Ωρών και Διαλειμμάτων"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Ώρες ({(effectivePeriods.length ?? 0)})</span>
          </button>

          {onEditProfile && (
            <button
              onClick={onEditProfile}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Επεξεργασία στοιχείων μέλους"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Προφίλ</span>
            </button>
          )}

          {canDelete && onDeleteMember && (
            <button
              onClick={onDeleteMember}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              title="Διαγραφή μέλους"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Formal Printable Header (Compact for single-page print) */}
      <div className="print-only pb-1 mb-1 border-b border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              🎒 {member.name} — Ωρολόγιο Πρόγραμμα
            </h1>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5">
              {student.schoolName || 'Σχολείο'} • {student.className || ''} • Σχόλασμα: {student.departureTime || (student.schoolLevel === 'kindergarten' ? '13:00' : '13:15')}{student.departureNote ? ` (${student.departureNote})` : ''}
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-500 font-mono">
            Σχολικό Έτος {student.schoolYear || '2026-2027'}
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs dark:shadow-xl space-y-4 transition-colors print:border-none print:shadow-none print:p-0">
          {/* Kindergarten Standard Routine View */}
          {student.schoolLevel === 'kindergarten' && !showMatrixForKindergarten ? (
            <div className="space-y-5">
              {/* Header Info Banner */}
              <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🧸</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <span>Ενιαίο Καθημερινό Ωράριο Νηπιαγωγείου</span>
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                        Δευτέρα – Παρασκευή
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Στο νηπιαγωγείο ακολουθείται ενιαία ροή ημέρας και βιωματικά εργαστήρια χωρίς διαχωρισμό σε επιμέρους μαθήματα.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Προσέλευση</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">08:15</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-700 font-bold">→</span>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Σχόλασμα</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {student.departureTime || '13:00'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMatrixForKindergarten(true)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 underline px-2 py-1 transition"
                    title="Εμφάνιση αναλυτικού εβδομαδιαίου πίνακα"
                  >
                    Πίνακας
                  </button>
                </div>
              </div>

              {/* Routine Flow Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {KINDERGARTEN_ROUTINE.map((block, idx) => {
                  const isAllDay = block.isAllDayOnly;
                  const depTime = student.departureTime || '13:00';
                  const isPastDismissal = isAllDay && depTime <= '13:00';

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3.5 transition-all flex items-start gap-3 ${
                        isPastDismissal
                          ? 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 opacity-60'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xs'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xl flex items-center justify-center shrink-0">
                        {block.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {block.title}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                            {block.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {block.desc}
                        </p>
                        {isAllDay && (
                          <span className="inline-block mt-1.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.5 rounded">
                            {isPastDismissal ? 'Προαιρετικό Ολοήμερο' : 'Ολοήμερο Πρόγραμμα'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extracurricular Activities row for Kindergarten */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Απογευματινές Δραστηριότητες (Εξωσχολικά)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Διαχείριση</span>
                  </button>
                </div>

                {student.afternoonActivities && student.afternoonActivities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {student.afternoonActivities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 flex items-center gap-2.5 shadow-2xs"
                      >
                        <span className="text-xl">{act.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                            {act.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {act.startTime} – {act.endTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Δεν έχουν καταχωρηθεί απογευματινές δραστηριότητες (κολύμβηση, παιδική γυμναστική κ.α.).
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {student.schoolLevel === 'kindergarten' && (
                <div className="flex justify-end pb-1 no-print">
                  <button
                    type="button"
                    onClick={() => setShowMatrixForKindergarten(false)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    ← Επιστροφή στο Ενιαίο Πρόγραμμα Νηπιαγωγείου
                  </button>
                </div>
              )}

              {/* Quick Palette for Subjects */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 space-y-2.5 no-print shadow-2xs">
                {/* Top Toolbar: Actions & View Controls */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isPrimary && (
                      <button
                        type="button"
                        onClick={handleToggleAllDay}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                          showAllDay
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title={showAllDay ? 'Απόκρυψη ωρών ολοημέρου' : 'Εμφάνιση ωρών ολοημέρου'}
                      >
                        <span>☀️</span>
                        <span>{showAllDay ? 'Ολοήμερο: Ενεργό' : 'Εμφάνιση Ολοημέρου'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsSubjectModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs"
                      title="Προσθήκη, επεξεργασία ή διαγραφή μαθημάτων"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Διαχείριση Μαθημάτων</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPeriodManager()}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs"
                      title="Προσθήκη, επεξεργασία ωραρίου & διαλειμμάτων"
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Ώρες & Διαλείμματα</span>
                    </button>

                    <button
                      onClick={() => setSelectedSubjectId(null)}
                      className={`px-3 py-1.5 rounded-xl border font-medium transition-all shrink-0 cursor-pointer ${
                        selectedSubjectId === null
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-500 shadow-xs font-bold'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      🖱️ Λεπτομερής Επεξεργασία
                    </button>
                  </div>

                  {/* Right side: Palette View Toggle & Scroll Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsPaletteExpanded((prev) => !prev)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title={isPaletteExpanded ? 'Σύμπτυξη σε μία γραμμή κύλισης' : 'Ανάπτυξη όλων των μαθημάτων σε σειρές'}
                    >
                      {isPaletteExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Σύμπτυξη</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Εμφάνιση Όλων ({effectiveSubjects.length})</span>
                        </>
                      )}
                    </button>

                    {!isPaletteExpanded && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => scrollPalette('left')}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                          title="Κύλιση αριστερά"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollPalette('right')}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                          title="Κύλιση δεξιά"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subjects Pills Row */}
                <div className="relative">
                  <div
                    ref={paletteRef}
                    onWheel={handlePaletteWheel}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                    className={`flex items-center gap-1.5 text-xs select-none ${
                      isPaletteExpanded
                        ? 'flex-wrap pt-1'
                        : 'overflow-x-auto pb-2 pt-0.5 scroll-smooth cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                      Γρήγορη Επιλογή:
                    </span>
                    {effectiveSubjects.map((subj) => {
                      const isSelected = selectedSubjectId === subj.id;
                      return (
                        <button
                          key={subj.id}
                          type="button"
                          onClick={() => setSelectedSubjectId(isSelected ? null : subj.id)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] cursor-pointer ${
                            isSelected ? 'text-white shadow-xs' : 'text-slate-800 dark:text-slate-100'
                          }`}
                          style={{
                            backgroundColor: isSelected ? subj.color : `${subj.color}20`,
                            color: isSelected ? '#ffffff' : undefined,
                            borderColor: isSelected ? subj.color : `${subj.color}50`,
                            fontWeight: isSelected ? 'bold' : '600',
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: isSelected ? '#ffffff' : subj.color }}
                          />
                          <span>{subj.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <TimetableGrid
                profile={profileCompatible}
                selectedSubjectId={selectedSubjectId}
                onSlotClick={handleSlotClick}
                onEditSlotModal={handleOpenEditSlotModal}
                onClearSlot={handleClearSlot}
                onToggleSaturday={handleToggleSaturday}
                onToggleAllDay={handleToggleAllDay}
                onOpenActivityManager={() => setIsActivityModalOpen(true)}
                onOpenPeriodManager={handleOpenPeriodManager}
              />
            </>
          )}
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs dark:shadow-xl transition-colors">
          <HomeworkTracker
            tasks={student.tasks}
            subjects={effectiveSubjects}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Απογευματινές & Εξωσχολικές Δραστηριότητες</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Φροντιστήρια, αθλήματα, ιδιαίτερα μαθήματα
              </p>
            </div>

            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Διαχείριση Δραστηριοτήτων</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {student.afternoonActivities && student.afternoonActivities.length > 0 ? (
              student.afternoonActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-xs dark:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        {act.icon || '⭐'}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{act.name}</h4>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                          {act.startTime} - {act.endTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <span className="text-slate-500">Ημέρες:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {act.days.join(', ')}
                      </span>
                    </p>
                    {act.location && (
                      <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="text-slate-500">Χώρος:</span>
                        <span>{act.location}</span>
                      </p>
                    )}
                    {act.instructor && (
                      <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="text-slate-500">Υπεύθυνος:</span>
                        <span>{act.instructor}</span>
                      </p>
                    )}
                    {act.notes && (
                      <p className="text-[11px] text-amber-800 dark:text-amber-300/80 italic bg-amber-50 dark:bg-amber-500/5 px-2 py-1 rounded border border-amber-200 dark:border-amber-500/15">
                        {act.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Activity className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-700 mb-2" />
                <p className="text-sm font-medium">Δεν έχουν οριστεί εξωσχολικές δραστηριότητες</p>
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                >
                  + Προσθήκη Δραστηριότητας
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cell Edit Modal */}
      {cellModalState.isOpen && cellModalState.period && (
        <CellEditModal
          isOpen={cellModalState.isOpen}
          onClose={() => setCellModalState({ isOpen: false, day: 'monday', period: null })}
          day={cellModalState.day}
          period={cellModalState.period}
          currentSlot={cellModalState.currentSlot}
          subjects={effectiveSubjects}
          onSave={handleSaveModalSlot}
        />
      )}

      {/* Activity Manager Modal */}
      {isActivityModalOpen && (
        <ActivityManagerModal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          activities={student.afternoonActivities || []}
          onSaveActivities={handleUpdateActivities}
        />
      )}

      {/* Subject Manager Modal */}
      {isSubjectModalOpen && (
        <SubjectManagerModal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          subjects={effectiveSubjects}
          schedule={student.schedule}
          onSaveSubjects={handleSaveSubjects}
        />
      )}

      {/* Period Manager Modal */}
      {isPeriodModalOpen && (
        <PeriodManagerModal
          isOpen={isPeriodModalOpen}
          onClose={() => {
            setIsPeriodModalOpen(false);
            setEditingPeriodId(null);
          }}
          periods={effectivePeriods}
          schedule={student.schedule}
          onSavePeriods={handleSavePeriods}
          initialEditPeriodId={editingPeriodId}
        />
      )}
    </div>
  );
};
