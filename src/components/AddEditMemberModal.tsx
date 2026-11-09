import React, { useState } from 'react';
import { X, UserPlus, Briefcase, GraduationCap, Clock, School, Sparkles } from 'lucide-react';
import { FamilyMember, MemberRole, SchoolLevel } from '../types';
import { CLASS_PRESETS, DEPARTURE_PRESETS, getDefaultProfileForLevel, PRIMARY_PERIODS, PRIMARY_ALL_DAY_PERIODS, PRIMARY_SUBJECTS } from '../data/studentPresets';

interface AddEditMemberModalProps {
  member?: FamilyMember | null;
  onClose: () => void;
  onSave: (member: FamilyMember) => void;
  onDelete?: (id: string) => void;
}

export const AddEditMemberModal: React.FC<AddEditMemberModalProps> = ({
  member,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(member?.name || '');
  const [role, setRole] = useState<MemberRole>(member?.role || 'worker');
  const [avatar, setAvatar] = useState(member?.avatar || (role === 'worker' ? '👨‍💼' : '🎒'));
  const [color, setColor] = useState(member?.color || (role === 'worker' ? '#f59e0b' : '#3b82f6'));
  const [jobTitle, setJobTitle] = useState(member?.workerData?.jobTitle || '');
  const initialContractHours: number =
    member?.workerData?.contractHours ||
    member?.workerData?.wageSettings?.contractHours ||
    (member?.name === 'Μαρία' ? 4 : 8);
  const [contractHours, setContractHours] = useState<number>(initialContractHours);

  // Student specific state
  const initialLevel: SchoolLevel = member?.studentData?.schoolLevel || 'primary';
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>(initialLevel);
  const [className, setClassName] = useState(member?.studentData?.className || "Β' Δημοτικού");
  const [schoolName, setSchoolName] = useState(
    member?.studentData?.schoolName || (initialLevel === 'kindergarten' ? '1ο Νηπιαγωγείο' : '1ο Δημοτικό')
  );
  const [departureTime, setDepartureTime] = useState(
    member?.studentData?.departureTime || (initialLevel === 'kindergarten' ? '13:00' : '13:15')
  );
  const [departureNote, setDepartureNote] = useState(
    member?.studentData?.departureNote || (initialLevel === 'kindergarten' ? 'Βασικό Πρόγραμμα' : 'Κανονικό (6ωρο)')
  );
  const [showAllDay, setShowAllDay] = useState<boolean>(
    member?.studentData?.showAllDay ??
    (member?.studentData?.departureTime ? member.studentData.departureTime > '13:15' : false)
  );

  const avatarOptions =
    role === 'worker'
      ? ['👨‍💼', '👩‍💻', '👨‍🔧', '👩‍⚕️', '👔', '💼']
      : ['🎒', '🧸', '👧', '👦', '⚽', '🎨', '🏊‍♂️', '🥋'];
  const colorOptions = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

  const handleSelectLevel = (newLevel: SchoolLevel) => {
    setSchoolLevel(newLevel);
    const preset = getDefaultProfileForLevel(newLevel);
    setClassName(preset.className);
    setSchoolName(preset.schoolName || (newLevel === 'kindergarten' ? '1ο Νηπιαγωγείο' : '1ο Δημοτικό'));
    setDepartureTime(preset.departureTime || (newLevel === 'kindergarten' ? '13:00' : '13:15'));
    setDepartureNote(preset.departureNote || (newLevel === 'kindergarten' ? 'Βασικό Πρόγραμμα' : 'Κανονικό (6ωρο)'));
    setShowAllDay(newLevel === 'primary');
  };

  const handleSelectDeparturePreset = (time: string, desc: string) => {
    setDepartureTime(time);
    setDepartureNote(desc);
    if (schoolLevel === 'primary') {
      setShowAllDay(time > '13:15');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = member?.id || `${role}-${Date.now()}`;
    const updatedMember: FamilyMember = {
      id,
      name: name.trim(),
      role,
      avatar,
      color,
      workerData:
        role === 'worker'
          ? {
              jobTitle: jobTitle.trim() || 'Εργασία',
              contractHours,
              shifts: member?.workerData?.shifts || {},
              employmentInfo: member?.workerData?.employmentInfo,
              documents: member?.workerData?.documents || member?.documents,
              wageSettings: {
                ...(member?.workerData?.wageSettings || {
                  baseSalary: 920,
                  trienniumBonus: 184,
                  hourlyWageMode: 'auto',
                  customHourlyWage: 6.62,
                  workingDaysBase: 25,
                  dailyHoursBase: contractHours === 8 ? 6.6667 : contractHours,
                  nightPremiumPercent: 25,
                  sundayHolidayPremiumPercent: 75,
                  overtimeWeekdayPercent: 40,
                  overtimeHolidayPercent: 75,
                }),
                contractHours,
                dailyHoursBase: member?.workerData?.wageSettings?.dailyHoursBase ?? (contractHours === 8 ? 6.6667 : contractHours),
              },
            }
          : undefined,
      documents: member?.documents || member?.workerData?.documents,
      studentData:
        role === 'student'
          ? {
              schoolLevel,
              schoolName: schoolName.trim() || (schoolLevel === 'kindergarten' ? 'Νηπιαγωγείο' : 'Σχολείο'),
              className: className.trim() || (schoolLevel === 'kindergarten' ? 'Νήπιο' : 'Τάξη'),
              schoolYear: member?.studentData?.schoolYear || '2026-2027',
              showSaturday: member?.studentData?.showSaturday ?? false,
              showAllDay: schoolLevel === 'primary' ? showAllDay : false,
              departureTime: departureTime || (schoolLevel === 'kindergarten' ? '13:00' : '13:15'),
              departureNote: departureNote || undefined,
              periods: (() => {
                if (schoolLevel === 'primary') {
                  const currentPeriods =
                    member?.studentData && member.studentData.schoolLevel === 'primary' && member.studentData.periods?.length > 0
                      ? member.studentData.periods
                      : PRIMARY_PERIODS;
                  const hasAllDay = currentPeriods.some((p) => p.id >= 7 || p.isAllDay);
                  if (!hasAllDay) {
                    return [...currentPeriods, ...PRIMARY_ALL_DAY_PERIODS];
                  }
                  return currentPeriods;
                }
                return member?.studentData && member.studentData.schoolLevel === schoolLevel && member.studentData.periods?.length > 0
                  ? member.studentData.periods
                  : getDefaultProfileForLevel(schoolLevel).periods;
              })(),
              subjects: (() => {
                if (schoolLevel === 'primary') {
                  const baseSubjects =
                    member?.studentData && member.studentData.schoolLevel === 'primary' && member.studentData.subjects?.length > 0
                      ? member.studentData.subjects
                      : PRIMARY_SUBJECTS;
                  const existingIds = new Set(baseSubjects.map((s) => s.id));
                  const allDaySubjs = PRIMARY_SUBJECTS.filter((s) => s.id.startsWith('pri-') && (s.id.includes('sitisi') || s.id.includes('meleti-olohmero') || s.id.includes('draseis') || s.id.includes('omiloi')));
                  const missing = allDaySubjs.filter((s) => !existingIds.has(s.id));
                  return missing.length > 0 ? [...baseSubjects, ...missing] : baseSubjects;
                }
                return member?.studentData && member.studentData.schoolLevel === schoolLevel && member.studentData.subjects?.length > 0
                  ? member.studentData.subjects
                  : getDefaultProfileForLevel(schoolLevel).subjects;
              })(),
              schedule: (() => {
                const baseSchedule =
                  member?.studentData && member.studentData.schoolLevel === schoolLevel
                    ? member.studentData.schedule
                    : getDefaultProfileForLevel(schoolLevel).schedule;
                if (schoolLevel === 'primary' && showAllDay) {
                  const hasPeriod7 = baseSchedule.some((s: any) => s.periodId === 7);
                  if (!hasPeriod7) {
                    const days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday')[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                    const extraSlots = days.flatMap((d) => [
                      { day: d, periodId: 7, subjectId: 'pri-sitisi' },
                      { day: d, periodId: 8, subjectId: 'pri-meleti-olohmero' },
                    ]);
                    return [...baseSchedule, ...extraSlots];
                  }
                }
                return baseSchedule;
              })(),
              tasks: member?.studentData?.tasks || [],
              afternoonActivities: member?.studentData?.afternoonActivities || [],
            }
          : undefined,
    };

    onSave(updatedMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
            <UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>{member ? 'Επεξεργασία Μέλους' : 'Προσθήκη Νέου Μέλους Οικογένειας'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Ρόλος στο Σπίτι
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('worker');
                  setAvatar('👨‍💼');
                  setColor('#f59e0b');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  role === 'worker'
                    ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span className="text-xs">Εργαζόμενος</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setAvatar(schoolLevel === 'kindergarten' ? '🧸' : '🎒');
                  setColor('#3b82f6');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-500 text-blue-800 dark:text-blue-300 font-bold shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                <span className="text-xs">Παιδί / Μαθητής</span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Όνομα *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="π.χ. Κώστας, Μαρία, Γιώργος, Αθανάσιος"
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Role specific fields */}
          {role === 'worker' ? (
            <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Τίτλος / Εργασία (Προαιρετικό)
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="π.χ. Τεχνική Υπηρεσία, Γραφείο, Βάρδια"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    <span>Σύμβαση Εργασίας / Ημερήσιο Ωράριο</span>
                  </span>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold font-mono">
                    {contractHours}ωρη
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { hours: 4, label: '4ωρη', sub: 'Μερική', desc: '4h / ημέρα' },
                    { hours: 6, label: '6ωρη', sub: 'Μερική', desc: '6h / ημέρα' },
                    { hours: 8, label: '8ωρη', sub: 'Πλήρης', desc: '8h / ημέρα' },
                  ].map((c) => {
                    const isSelected = contractHours === c.hours;
                    return (
                      <button
                        key={c.hours}
                        type="button"
                        onClick={() => setContractHours(c.hours)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-500/20 border-sky-500 text-sky-800 dark:text-sky-300 font-bold shadow-xs scale-[1.02]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-sm font-bold font-mono">{c.label}</span>
                        <span className="text-[11px] font-semibold">{c.sub}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{c.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5">
              {/* 1. School Level Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                    <span>Βαθμίδα Εκπαίδευσης</span>
                  </span>
                  {schoolLevel === 'kindergarten' && (
                    <span className="text-[10px] normal-case font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Στάνταρ ωράριο χωρίς μαθήματα
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'kindergarten', label: 'Νηπιαγωγείο', icon: '🧸', desc: 'Ενιαίο ωράριο' },
                    { id: 'primary', label: 'Δημοτικό', icon: '🎒', desc: '6 ώρες' },
                    { id: 'gymnasium', label: 'Γυμνάσιο', icon: '📐', desc: '7 ώρες' },
                    { id: 'lyceum', label: 'Λύκειο', icon: '🎓', desc: '7 ώρες' },
                  ].map((lvl) => {
                    const isSelected = schoolLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleSelectLevel(lvl.id as SchoolLevel)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300 font-bold shadow-xs scale-[1.02]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-base">{lvl.icon}</span>
                        <span className="text-xs">{lvl.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{lvl.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Departure Time Selector (Ώρα Αποχώρησης) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ώρα Αποχώρησης (Σχόλασμα)</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    {departureTime} {departureNote ? `(${departureNote})` : ''}
                  </span>
                </label>

                {/* Preset Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {(DEPARTURE_PRESETS[schoolLevel] || []).map((p) => {
                    const isSelected = departureTime === p.time;
                    return (
                      <button
                        key={p.time}
                        type="button"
                        onClick={() => handleSelectDeparturePreset(p.time, p.desc)}
                        className={`px-2.5 py-1 rounded-lg text-xs border font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                        title={p.desc}
                      >
                        {p.label} <span className="text-[10px] opacity-80">({p.desc})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Time input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Προσαρμοσμένη ώρα:</span>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => {
                      setDepartureTime(e.target.value);
                      setDepartureNote('Προσαρμοσμένη');
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 truncate">
                    (για ειδοποιήσεις παραλαβής)
                  </span>
                </div>

                {/* All-Day toggle box for Primary School */}
                {schoolLevel === 'primary' && (
                  <div className="mt-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">☀️</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>Ολοήμερο Πρόγραμμα Δημοτικού</span>
                          <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.2 rounded">
                            {showAllDay ? 'Ενεργό' : 'Ανενεργό'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                          Σίτιση (13:20–14:00), Μελέτη (14:15–15:00) & Δράσεις
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !showAllDay;
                        setShowAllDay(next);
                        if (next && departureTime <= '13:15') {
                          setDepartureTime('14:55');
                          setDepartureNote('Ολοήμερο (1η Ζώνη)');
                        } else if (!next && departureTime > '13:15') {
                          setDepartureTime('13:15');
                          setDepartureNote('Κανονικό (6ωρο)');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        showAllDay
                          ? 'bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {showAllDay ? '✓ Ενεργό' : '+ Ενεργοποίηση'}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Class presets & input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Τάξη / Τμήμα
                </label>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {(CLASS_PRESETS[schoolLevel] || []).map((cp) => {
                    const isSelected = className.startsWith(cp.id);
                    return (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => setClassName(cp.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs border font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {cp.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder={
                    schoolLevel === 'kindergarten'
                      ? 'π.χ. Νήπιο, Μικρά Νήπια'
                      : "π.χ. Β' Δημοτικού (Β1)"
                  }
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* 4. School Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  <span>Όνομα Σχολείου (Προαιρετικό)</span>
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder={
                    schoolLevel === 'kindergarten'
                      ? 'π.χ. 1ο Νηπιαγωγείο'
                      : 'π.χ. 11ο Δημοτικό Σχολείο'
                  }
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Avatar Emoji picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Εικονίδιο / Avatar
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {avatarOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAvatar(opt)}
                  className={`w-9 h-9 text-lg rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    avatar === opt
                      ? 'bg-slate-100 dark:bg-slate-800 border-amber-500 dark:border-amber-400 scale-110 shadow'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Χρώμα στο Κοινό Πλάνο
            </label>
            <div className="flex items-center gap-2.5">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    color === c ? 'border-slate-900 dark:border-white scale-125 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            {member && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Σίγουρα θέλετε να διαγράψετε το μέλος "${member.name}";`)) {
                    onDelete(member.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold underline cursor-pointer"
              >
                Διαγραφή Μέλους
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Άκυρο
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {member ? 'Αποθήκευση' : 'Προσθήκη'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
