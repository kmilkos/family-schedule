import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sliders,
  BarChart3,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  AlertCircle,
  Edit3,
  Trash2,
  FileText,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { FamilyMember, GreekHoliday, ShiftEntry, WageSettings } from '../../types';
import { MonthCalendar } from './MonthCalendar';
import { DayEditModal } from './DayEditModal';
import { AnnualSummaryView } from './AnnualSummaryView';
import { HolidaysAndSettingsModal } from './HolidaysAndSettingsModal';
import { MemberDocumentsModal } from '../common/MemberDocumentsModal';
import { calculateMonthSummary, GREEK_MONTHS } from '../../utils/shiftCalculations';

interface WorkerViewProps {
  member: FamilyMember;
  holidays: GreekHoliday[];
  onUpdateMember: (updated: FamilyMember) => void;
  onUpdateHolidays: (holidays: GreekHoliday[]) => void;
  onEditProfile?: () => void;
  onDeleteMember?: () => void;
  canDelete?: boolean;
  initialSelectedDate?: string | null;
}

export const WorkerView: React.FC<WorkerViewProps> = ({
  member,
  holidays,
  onUpdateMember,
  onUpdateHolidays,
  onEditProfile,
  onDeleteMember,
  canDelete,
  initialSelectedDate,
}) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string | null>(initialSelectedDate || null);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'ANNUAL'>('CALENDAR');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

  const docs = useMemo(() => member.workerData?.documents || member.documents || [], [member.workerData?.documents, member.documents]);
  const empInfo = member.workerData?.employmentInfo;

  const shifts = useMemo(() => member.workerData?.shifts || {}, [member.workerData?.shifts]);
  const contractHours =
    member.workerData?.contractHours ||
    member.workerData?.wageSettings?.contractHours ||
    (member.name === 'Μαρία' ? 4 : 8);

  const wageSettings = member.workerData?.wageSettings || {
    baseSalary: 920,
    trienniumBonus: 184,
    hourlyWageMode: 'auto',
    customHourlyWage: 6.62,
    workingDaysBase: 25,
    dailyHoursBase: contractHours === 8 ? 6.6667 : contractHours,
    contractHours,
    nightPremiumPercent: 25,
    sundayHolidayPremiumPercent: 75,
    overtimeWeekdayPercent: 40,
    overtimeHolidayPercent: 75,
  };

  // Month calculation summary
  const monthSummary = useMemo(() => {
    return calculateMonthSummary(currentYear, currentMonth, shifts, holidays, wageSettings);
  }, [currentYear, currentMonth, shifts, holidays, wageSettings]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleSaveShift = (newEntry: ShiftEntry) => {
    const updatedShifts = { ...shifts };
    if (newEntry.type === 'EMPTY') {
      delete updatedShifts[newEntry.date];
    } else {
      updatedShifts[newEntry.date] = newEntry;
    }

    onUpdateMember({
      ...member,
      workerData: {
        ...member.workerData,
        shifts: updatedShifts,
      },
    });
    setSelectedDate(null);
  };

  const handleDeleteShift = (dateStr: string) => {
    const updatedShifts = { ...shifts };
    delete updatedShifts[dateStr];
    onUpdateMember({
      ...member,
      workerData: {
        ...member.workerData,
        shifts: updatedShifts,
      },
    });
    setSelectedDate(null);
  };

  const handleSaveHolidays = (newHols: GreekHoliday[]) => {
    onUpdateHolidays(newHols);
  };

  const handleSaveWageSettings = (newWage: WageSettings) => {
    onUpdateMember({
      ...member,
      workerData: {
        ...member.workerData,
        shifts,
        contractHours: newWage.contractHours,
        wageSettings: newWage,
      },
    });
  };

  const handleClearAllShifts = () => {
    if (window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε όλες τις βάρδιες για ${member.name};`)) {
      onUpdateMember({
        ...member,
        workerData: {
          ...member.workerData,
          shifts: {},
        },
      });
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(shifts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shifts_${member.name.toLowerCase()}_${currentYear}.json`;
    a.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          onUpdateMember({
            ...member,
            workerData: {
              ...member.workerData,
              shifts: { ...shifts, ...parsed },
            },
          });
          alert('Επιτυχής εισαγωγή βαρδιών!');
        }
      } catch (err) {
        alert('Μη έγκυρο αρχείο JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Profile & Month Control Bar (Screen only) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs dark:shadow-xl transition-colors no-print">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border shadow-xs dark:shadow-lg shrink-0"
            style={{ backgroundColor: `${member.color}20`, borderColor: member.color }}
          >
            {member.avatar || '👨‍💼'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{member.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30">
                {member.workerData?.jobTitle || 'Εργαζόμενος'}
              </span>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                title="Ρύθμιση ωραρίου σύμβασης (4ωρη / 6ωρη / 8ωρη)"
              >
                <span>⏱️</span>
                <span>{contractHours}ωρη Σύμβαση</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ημερολόγιο βαρδιών, υπερωρίες & εκτίμηση μισθοδοσίας
            </p>
          </div>
        </div>

        {/* Month Navigator & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {viewMode === 'CALENDAR' && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Προηγούμενος μήνας"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleJumpToday}
                className="px-3 py-1 font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                title="Μετάβαση στον τρέχοντα μήνα"
              >
                {GREEK_MONTHS[currentMonth]} {currentYear}
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Επόμενος μήνας"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'CALENDAR'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Μήνας</span>
            </button>
            <button
              onClick={() => setViewMode('ANNUAL')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'ANNUAL'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Ετήσια Σύνοψη</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsDocumentsOpen(true)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              docs.length > 0
                ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Έγγραφα, σύμβαση & ΕΡΓΑΝΗ"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Έγγραφα</span>
            {docs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {docs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Ρυθμίσεις μισθοδοσίας & αργιών"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {onEditProfile && (
            <button
              onClick={onEditProfile}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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

      {/* Employment / Contract Banner (if employment details exist) */}
      {empInfo && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs dark:shadow-md no-print">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {empInfo.employer}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30">
                  {empInfo.contractType}
                </span>
                {empInfo.contractDuration && (
                  <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ({empInfo.contractDuration})
                  </span>
                )}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                {empInfo.monthlySalary && (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    💰 {empInfo.monthlySalary.toFixed(2)} € ({empInfo.hourlyWage ? `${empInfo.hourlyWage.toFixed(2)} €/h` : '6,92 €/h'}) •
                  </span>
                )}
                <span>📍 {empInfo.workplace} • ⏱️ {empInfo.dailyHours || 8}ωρο / {empInfo.weeklyHours || 40}h εβδομαδιαίως (Διάλειμμα 30' εντός)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {docs[0]?.fileUrl && (
              <a
                href={docs[0].fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/15 dark:hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Άνοιγμα δήλωσης ΕΡΓΑΝΗ σε νέα καρτέλα (PDF)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ΕΡΓΑΝΗ PDF</span>
              </a>
            )}
            <button
              id="btn-open-documents-modal"
              type="button"
              onClick={() => setIsDocumentsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Στοιχεία Σύμβασης</span>
            </button>
          </div>
        </div>
      )}

      {/* Monthly Fast Metric Cards (only on calendar view - Screen only) */}
      {viewMode === 'CALENDAR' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 no-print">
          <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
            <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Εργάσιμες Ημέρες</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {monthSummary.totalWorkDays}{' '}
              <span className="text-xs text-slate-500 font-normal">ημέρες</span>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
            <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Ρεπό / Άδειες</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {monthSummary.totalRepoDays} <span className="text-xs text-slate-500 font-normal">ρεπό</span>
              {monthSummary.totalAdeiaDays > 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1">+{monthSummary.totalAdeiaDays} άδεια</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
            <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Συνολικές Ώρες</div>
            <div className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100">
              {monthSummary.totalWorkedHours.toFixed(1)} ώρες
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
            <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Νυχτερινές Ώρες</div>
            <div className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {(monthSummary.nightNormalHours + monthSummary.nightHolidayHours).toFixed(1)} ώρες
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
            <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Κυριακές / Αργίες</div>
            <div className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400">
              {monthSummary.sundayHolidayWorkedHours.toFixed(1)} ώρες
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
            <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Προσαυξήσεις (+25/+75%)</div>
            <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-300">
              +{monthSummary.estimatedTotalPremiums.toFixed(2)} €
            </div>
          </div>
        </div>
      )}

      {/* Printable Header (Compact for single-page print) */}
      <div className="print-only pb-1 mb-1 border-b border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              💼 {member.name} — Πρόγραμμα Βαρδιών ({member.workerData?.jobTitle || 'Εργασία'})
            </h1>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5">
              {GREEK_MONTHS[currentMonth]} {currentYear}
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-500 font-mono">
            HouseSchedule • Εκτύπωση: {new Date().toLocaleDateString('el-GR')}
          </div>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'CALENDAR' ? (
        <MonthCalendar
          year={currentYear}
          month={currentMonth}
          entries={shifts}
          holidays={holidays}
          onSelectDay={(dateStr) => setSelectedDate(dateStr)}
        />
      ) : (
        <AnnualSummaryView
          year={currentYear}
          entries={shifts}
          holidays={holidays}
          wageSettings={wageSettings}
          onSelectMonth={(m) => {
            setCurrentMonth(m);
            setViewMode('CALENDAR');
          }}
          onSelectDay={(dateStr) => {
            setSelectedDate(dateStr);
            setViewMode('CALENDAR');
          }}
          onSelectYear={(y) => setCurrentYear(y)}
        />
      )}

      {/* Day Edit Modal */}
      {selectedDate && (
        <DayEditModal
          isOpen={!!selectedDate}
          dateStr={selectedDate}
          entry={shifts[selectedDate]}
          holidays={holidays}
          contractHours={contractHours}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <HolidaysAndSettingsModal
          isOpen={isSettingsOpen}
          year={currentYear}
          month={currentMonth}
          holidays={holidays}
          wageSettings={wageSettings}
          onSaveHolidays={handleSaveHolidays}
          onSaveWageSettings={handleSaveWageSettings}
          onLoadDemoData={() => {}}
          onClearAllShifts={handleClearAllShifts}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Documents & Contract Modal */}
      {isDocumentsOpen && (
        <MemberDocumentsModal
          isOpen={isDocumentsOpen}
          member={member}
          onClose={() => setIsDocumentsOpen(false)}
          onUpdateMember={onUpdateMember}
        />
      )}
    </div>
  );
};
