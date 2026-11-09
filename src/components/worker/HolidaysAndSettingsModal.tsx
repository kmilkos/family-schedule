import React, { useState } from 'react';
import { GreekHoliday, WagePeriod, WageSettings } from '../../types';
import { DEFAULT_GREEK_HOLIDAYS_2026, DEFAULT_WAGE_PERIODS, DEFAULT_WAGE_SETTINGS } from '../../data/holidays2026';
import { GREEK_MONTHS } from '../../utils/shiftCalculations';
import { X, Plus, Trash2, RotateCcw, Save, Shield, Sliders, Calendar, Download, Upload, AlertTriangle, FileSpreadsheet, Clock, TrendingUp } from 'lucide-react';

interface HolidaysAndSettingsModalProps {
  isOpen: boolean;
  year: number;
  month: number;
  holidays: GreekHoliday[];
  wageSettings: WageSettings;
  onSaveHolidays: (holidays: GreekHoliday[]) => void;
  onSaveWageSettings: (settings: WageSettings) => void;
  onLoadDemoData: () => void;
  onClearAllShifts: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenImportSchedule?: () => void;
  onExportIcsMonth?: () => void;
  onExportIcsYear?: () => void;
  onClose: () => void;
}

export const HolidaysAndSettingsModal: React.FC<HolidaysAndSettingsModalProps> = ({
  isOpen,
  year,
  month,
  holidays,
  wageSettings,
  onSaveHolidays,
  onSaveWageSettings,
  onLoadDemoData,
  onClearAllShifts,
  onExportJson,
  onImportJson,
  onOpenImportSchedule,
  onExportIcsMonth,
  onExportIcsYear,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'WAGE' | 'HOLIDAYS' | 'DATA'>('WAGE');

  // Local wage settings state
  const [localWage, setLocalWage] = useState<WageSettings>({ ...wageSettings });

  // Local holidays state
  const [localHolidays, setLocalHolidays] = useState<GreekHoliday[]>([...holidays]);
  const [newHolDate, setNewHolDate] = useState('2026-');
  const [newHolName, setNewHolName] = useState('');
  const [newHolIsBanking, setNewHolIsBanking] = useState(false);

  if (!isOpen) return null;

  const handleAddHoliday = () => {
    if (!newHolDate || !newHolName.trim()) return;
    setLocalHolidays((prev) => {
      // replace if date exists, or append
      const filtered = prev.filter((h) => h.date !== newHolDate);
      return [
        ...filtered,
        {
          date: newHolDate,
          name: newHolName.trim(),
          isBankingHoliday: newHolIsBanking,
          isCustom: true,
        },
      ].sort((a, b) => a.date.localeCompare(b.date));
    });
    setNewHolName('');
  };

  const handleUpdateHolidayName = (date: string, updatedName: string) => {
    setLocalHolidays((prev) =>
      prev.map((h) => (h.date === date ? { ...h, name: updatedName } : h))
    );
  };

  const handleToggleHolidayBanking = (date: string) => {
    setLocalHolidays((prev) =>
      prev.map((h) =>
        h.date === date ? { ...h, isBankingHoliday: !h.isBankingHoliday } : h
      )
    );
  };

  const handleRemoveHoliday = (date: string) => {
    setLocalHolidays((prev) => prev.filter((h) => h.date !== date));
  };

  const handleResetHolidays = () => {
    setLocalHolidays([...DEFAULT_GREEK_HOLIDAYS_2026]);
  };

  // Wage periods management
  const handleAddWagePeriod = () => {
    const newPeriod: WagePeriod = {
      id: `p-${Date.now()}`,
      startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
      label: 'Νέα Περίοδος',
      baseSalary: localWage.baseSalary,
      trienniumBonus: localWage.trienniumBonus || 0,
      hourlyWageMode: 'auto',
      customHourlyWage: 6.62,
    };
    const currentList = localWage.wagePeriods || [];
    setLocalWage({
      ...localWage,
      wagePeriods: [...currentList, newPeriod].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    });
  };

  const handleUpdateWagePeriod = (id: string, updates: Partial<WagePeriod>) => {
    const currentList = localWage.wagePeriods || [];
    setLocalWage({
      ...localWage,
      wagePeriods: currentList.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const handleRemoveWagePeriod = (id: string) => {
    const currentList = localWage.wagePeriods || [];
    setLocalWage({
      ...localWage,
      wagePeriods: currentList.filter((p) => p.id !== id),
    });
  };

  const handleResetWagePeriods = () => {
    setLocalWage({
      ...localWage,
      wagePeriods: [...DEFAULT_WAGE_PERIODS],
    });
  };

  const handleSaveAll = () => {
    onSaveWageSettings(localWage);
    onSaveHolidays(localHolidays);
    onClose();
  };

  // Total current base salary + triennium
  const totalCurrentMonthly = (localWage.baseSalary || 0) + (localWage.trienniumBonus || 0);

  // Calculated hourly rate display
  const effectiveHourly = localWage.hourlyWageMode === 'auto'
    ? (localWage.workingDaysBase * localWage.dailyHoursBase > 0
        ? Math.round((totalCurrentMonthly / (localWage.workingDaysBase * localWage.dailyHoursBase)) * 1000) / 1000
        : 0)
    : localWage.customHourlyWage;

  const nightRatePay = Math.round(effectiveHourly * (localWage.nightPremiumPercent / 100) * 100) / 100;
  const sundayHolidayRatePay = Math.round(effectiveHourly * (localWage.sundayHolidayPremiumPercent / 100) * 100) / 100;
  const overtimeWeekdayRatePay = Math.round(effectiveHourly * (1 + localWage.overtimeWeekdayPercent / 100) * 100) / 100;
  const overtimeHolidayRatePay = Math.round(effectiveHourly * (1 + localWage.overtimeHolidayPercent / 100) * 100) / 100;

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="settings-modal-dialog"
        className="relative w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Ρυθμίσεις Βαρδιών & Επίσημες Αργίες</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('WAGE')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'WAGE'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Μισθοδοσία & Συντελεστές
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HOLIDAYS')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'HOLIDAYS'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Επίσημες Αργίες 2026 ({localHolidays.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DATA')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'DATA'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Download className="h-4 w-4" />
            Δεδομένα & Αντίγραφα
          </button>
        </div>

        {/* Content Area */}
        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Wage Settings */}
          {activeTab === 'WAGE' && (
            <div className="space-y-5">
              {/* Contract Hours Setting Card */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-500" />
                      <span>Σύμβαση Εργασίας & Ημερήσιο Ωράριο</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Καθορίζει την τυπική διάρκεια βάρδιας (πρότυπα) και τις ώρες βάσης της σύμβασης
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 self-start sm:self-center">
                    {(localWage.contractHours || 8)}ωρη Σύμβαση
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {[
                    {
                      hours: 4,
                      title: '4ωρη Σύμβαση',
                      type: 'Μερική Απασχόληση',
                      desc: '4 ώρες/ημ. • 20 ώρες/εβδ.',
                      defaultShift: '10:00 – 14:00',
                    },
                    {
                      hours: 6,
                      title: '6ωρη Σύμβαση',
                      type: 'Μερική Απασχόληση',
                      desc: '6 ώρες/ημ. • 30 ώρες/εβδ.',
                      defaultShift: '10:00 – 16:00',
                    },
                    {
                      hours: 8,
                      title: '8ωρη Σύμβαση',
                      type: 'Πλήρης Απασχόληση',
                      desc: '8 ώρες/ημ. • 40 ώρες/εβδ.',
                      defaultShift: '08:00 – 16:00',
                    },
                  ].map((preset) => {
                    const isSelected = (localWage.contractHours || 8) === preset.hours;
                    return (
                      <button
                        key={preset.hours}
                        type="button"
                        onClick={() => {
                          const newDailyBase = preset.hours === 8 ? 6.6667 : preset.hours;
                          setLocalWage({
                            ...localWage,
                            contractHours: preset.hours,
                            dailyHoursBase: newDailyBase,
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-500 shadow-xs ring-1 ring-sky-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{preset.title}</span>
                              {isSelected && <span className="text-sky-500 text-xs">✓</span>}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                              {preset.type}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                            {preset.hours}h
                          </span>
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1.5 flex flex-col gap-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{preset.desc}</span>
                          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">Πρότυπο: {preset.defaultShift}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
                  Υπολογισμός Ωρομισθίου (Τύπος Υπολογισμού)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Βάσει της σύμβασης: Ωρομίσθιο = Βασικός Μισθός / ({localWage.workingDaysBase} ημέρες × {localWage.dailyHoursBase} ώρες) = Βασικός / {(localWage.workingDaysBase * localWage.dailyHoursBase).toFixed(2)} ώρες
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Βασικός Μισθός (€)
                    </label>
                    <input
                      type="number"
                      value={localWage.baseSalary}
                      onChange={(e) =>
                        setLocalWage({ ...localWage, baseSalary: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Π.χ. 880 € ή 920 €
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Επίδομα Τριετιών (€)
                    </label>
                    <input
                      type="number"
                      value={localWage.trienniumBonus ?? 0}
                      onChange={(e) =>
                        setLocalWage({ ...localWage, trienniumBonus: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      1η 3ετία (10%), 2η 3ετία (20%)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Τρόπος Υπολογισμού
                    </label>
                    <select
                      value={localWage.hourlyWageMode}
                      onChange={(e) =>
                        setLocalWage({
                          ...localWage,
                          hourlyWageMode: e.target.value as 'auto' | 'custom',
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="auto">Αυτόματο (Σύνολο / 166.67h)</option>
                      <option value="custom">Χειροκίνητο / Σταθερό</option>
                    </select>
                  </div>
                </div>

                {localWage.hourlyWageMode === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ειδικό Ωρομίσθιο (€ / ώρα)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={localWage.customHourlyWage}
                      onChange={(e) =>
                        setLocalWage({
                          ...localWage,
                          customHourlyWage: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full sm:w-48 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Συνολικές Τακτικές Αποδοχές:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {totalCurrentMonthly.toFixed(2)} € / μήνα
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">({localWage.baseSalary} € + {localWage.trienniumBonus || 0} €)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Τρέχον Ωρομίσθιο:</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                      {effectiveHourly.toFixed(3)} € / ώρα
                    </span>
                  </div>
                </div>

                {/* Additional Divisor Settings toggle if auto */}
                {localWage.hourlyWageMode === 'auto' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 mb-1">Ημέρες Βάσης Μήνα</label>
                      <input
                        type="number"
                        value={localWage.workingDaysBase}
                        onChange={(e) =>
                          setLocalWage({
                            ...localWage,
                            workingDaysBase: parseFloat(e.target.value) || 25,
                          })
                        }
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-800 dark:text-slate-100 font-mono"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Πρότυπο: 25 ημέρες</span>
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 mb-1">Ημερήσιες Ώρες Βάσης</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={localWage.dailyHoursBase}
                        onChange={(e) =>
                          setLocalWage({
                            ...localWage,
                            dailyHoursBase: parseFloat(e.target.value) || 6.6667,
                          })
                        }
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-800 dark:text-slate-100 font-mono"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        25 × {localWage.dailyHoursBase} = {(localWage.workingDaysBase * localWage.dailyHoursBase).toFixed(2)}h
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Wage Periods History & Timeline */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#c41230] dark:text-[#ff4d6d]" />
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      Χρονολόγιο Αποδοχών & Τριετιών (Ανά Περίοδο)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetWagePeriods}
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline"
                    >
                      Επαναφορά
                    </button>
                    <button
                      type="button"
                      onClick={handleAddWagePeriod}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 text-xs text-white hover:bg-sky-500 transition font-medium"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Προσθήκη Περιόδου
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Όταν αλλάζει ο βασικός μισθός ή συμπληρώνεται νέα 3ετία εργασίας (1η, 2η, 3η τριετία), ορίζετε την ημερομηνία έναρξης ώστε οι υπολογισμοί κάθε μήνα να εφαρμόζουν τις αντίστοιχες αποδοχές.
                </p>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {(localWage.wagePeriods || []).map((period) => {
                    const pTotal = (period.baseSalary || 0) + (period.trienniumBonus || 0);
                    const pHourly = period.hourlyWageMode === 'auto'
                      ? ((localWage.workingDaysBase * localWage.dailyHoursBase > 0)
                          ? Math.round((pTotal / (localWage.workingDaysBase * localWage.dailyHoursBase)) * 1000) / 1000
                          : 0)
                      : period.customHourlyWage;

                    return (
                      <div
                        key={period.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 p-2.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center gap-2.5 flex-1">
                          <div className="w-38 min-w-[148px]">
                            <label className="block text-[10px] text-slate-400 font-medium mb-0.5">Από (Ημ/νία)</label>
                            <input
                              type="date"
                              value={period.startDate}
                              onChange={(e) => handleUpdateWagePeriod(period.id, { startDate: e.target.value })}
                              className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          <div className="flex-1 min-w-[130px]">
                            <label className="block text-[10px] text-slate-400 font-medium">Περιγραφή / Τριετία</label>
                            <input
                              type="text"
                              value={period.label}
                              onChange={(e) => handleUpdateWagePeriod(period.id, { label: e.target.value })}
                              placeholder="π.χ. 2η Τριετία"
                              className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          <div className="w-20">
                            <label className="block text-[10px] text-slate-400 font-medium">Βασικός (€)</label>
                            <input
                              type="number"
                              value={period.baseSalary}
                              onChange={(e) => handleUpdateWagePeriod(period.id, { baseSalary: parseFloat(e.target.value) || 0 })}
                              className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-mono text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          <div className="w-20">
                            <label className="block text-[10px] text-slate-400 font-medium">3ετία (€)</label>
                            <input
                              type="number"
                              value={period.trienniumBonus}
                              onChange={(e) => handleUpdateWagePeriod(period.id, { trienniumBonus: parseFloat(e.target.value) || 0 })}
                              className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-mono text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          <div className="flex flex-col items-end min-w-[90px]">
                            <span className="text-[10px] text-slate-400 font-medium">Σύνολο / Ώρα</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {pTotal}€ <span className="text-[10px] text-emerald-600 dark:text-emerald-400">({pHourly.toFixed(3)}€/h)</span>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveWagePeriod(period.id)}
                          title="Διαγραφή περιόδου"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Premium percentages */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3">
                  Ποσοστά Προσαυξήσεων (Εργατική Νομοθεσία & ΣΣΕ)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">Νυχτερινά (%)</label>
                    <input
                      type="number"
                      value={localWage.nightPremiumPercent}
                      onChange={(e) =>
                        setLocalWage({
                          ...localWage,
                          nightPremiumPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-100"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">22:00-06:00 (default 25%)</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">Κυριακές/Αργίες (%)</label>
                    <input
                      type="number"
                      value={localWage.sundayHolidayPremiumPercent}
                      onChange={(e) =>
                        setLocalWage({
                          ...localWage,
                          sundayHolidayPremiumPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-100"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Προσαύξηση (default 75%)</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">Υπερωρία Καθημ. (%)</label>
                    <input
                      type="number"
                      value={localWage.overtimeWeekdayPercent}
                      onChange={(e) =>
                        setLocalWage({
                          ...localWage,
                          overtimeWeekdayPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-100"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Καθημερινές (default 40%)</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">Υπερωρία Αργίας (%)</label>
                    <input
                      type="number"
                      value={localWage.overtimeHolidayPercent}
                      onChange={(e) =>
                        setLocalWage({
                          ...localWage,
                          overtimeHolidayPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-100"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Αργίες/Κυρ. (default 75%)</span>
                  </div>
                </div>

                {/* Live Simulation preview */}
                <div className="mt-4 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 p-3 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                    Προεπισκόπηση Υπολογισμού Ανά Ώρα (Βάσει των ρυθμίσεών σας):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 block">Νυχτερινή Ώρα (+{localWage.nightPremiumPercent}%)</span>
                      <span className="font-mono font-bold text-indigo-900 dark:text-indigo-300">+{nightRatePay.toFixed(2)} € / h</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 block">Κυριακή / Αργία (+{localWage.sundayHolidayPremiumPercent}%)</span>
                      <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300">+{sundayHolidayRatePay.toFixed(2)} € / h</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 block">Υπερωρία Καθημ. (+{localWage.overtimeWeekdayPercent}%)</span>
                      <span className="font-mono font-bold text-amber-900 dark:text-amber-300">{overtimeWeekdayRatePay.toFixed(2)} € / h</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 block">Υπερωρία Αργίας (+{localWage.overtimeHolidayPercent}%)</span>
                      <span className="font-mono font-bold text-rose-900 dark:text-rose-300">{overtimeHolidayRatePay.toFixed(2)} € / h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Holidays 2026 */}
          {activeTab === 'HOLIDAYS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    Προεγκατεστημένες Επίσημες & Τραπεζικές Αργίες 2026
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Αυτόματος χαρακτηρισμός ημερών ως Αργία (+75% προσαύξηση)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetHolidays}
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Επαναφορά Αρχικών
                </button>
              </div>

              {/* Add Custom Holiday */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 flex flex-wrap items-end gap-2 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Ημερομηνία</label>
                  <input
                    type="date"
                    value={newHolDate}
                    onChange={(e) => setNewHolDate(e.target.value)}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Όνομα Αργίας</label>
                  <input
                    type="text"
                    placeholder="π.χ. Τοπική Πολιούχου"
                    value={newHolName}
                    onChange={(e) => setNewHolName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 pb-2">
                  <input
                    type="checkbox"
                    id="banking-hol-check"
                    checked={newHolIsBanking}
                    onChange={(e) => setNewHolIsBanking(e.target.checked)}
                    className="rounded text-sky-500 focus:ring-sky-500"
                  />
                  <label htmlFor="banking-hol-check" className="text-slate-700 dark:text-slate-300 text-xs">
                    Τραπεζική
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  className="rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition"
                >
                  Προσθήκη
                </button>
              </div>

              {/* Holidays List */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 max-h-72 overflow-y-auto">
                {localHolidays.map((h) => (
                  <div
                    key={h.date}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                  >
                    <div className="flex flex-1 min-w-[200px] items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-24 shrink-0">{h.date}</span>
                      <input
                        type="text"
                        value={h.name}
                        onChange={(e) => handleUpdateHolidayName(h.date, e.target.value)}
                        className="flex-1 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#c41230] bg-transparent focus:bg-white dark:focus:bg-slate-800 px-2 py-1 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none"
                        title="Κάντε κλικ για επεξεργασία ονόματος"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleHolidayBanking(h.date)}
                        title="Κλικ για εναλλαγή τραπεζικής αργίας"
                        className={`rounded px-2 py-0.5 text-[11px] font-semibold border transition ${
                          h.isBankingHoliday
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {h.isBankingHoliday ? '✓ Τραπεζική' : 'Επίσημη'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(h.date)}
                        className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Διαγραφή αργίας"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Data Management & Backup */}
          {activeTab === 'DATA' && (
            <div className="space-y-5 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Αντίγραφα Ασφαλείας & Μεταφορά Δεδομένων
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  Μπορείτε να κάνετε λήψη όλων των καταχωρημένων βαρδιών σε αρχείο JSON για ασφάλεια ή για μεταφορά σε άλλη συσκευή.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onExportJson}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition"
                  >
                    <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Εξαγωγή Αντιγράφου (JSON)
                  </button>

                  <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs cursor-pointer transition">
                    <Upload className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Επαναφορά από JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={onImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Google Calendar / Outlook .ICS Export */}
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-indigo-950 dark:text-indigo-200 text-sm flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Εξαγωγή σε Ημερολόγιο (.ics)</span>
                  </h5>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-bold">
                    Google / Apple / Outlook
                  </span>
                </div>
                <p className="text-indigo-900/80 dark:text-indigo-300/80 text-xs">
                  Δημιουργία αρχείου .ics με όλες τις βάρδιες (με σωστή κάλυψη μεσονυχτίου για τις ολονύχτιες) και ολοήμερες καταχωρήσεις για Αργίες, Άδειες και Ρεπό.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {onExportIcsMonth && (
                    <button
                      type="button"
                      onClick={onExportIcsMonth}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 px-3 py-2 font-medium text-indigo-900 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-slate-800 shadow-2xs transition"
                    >
                      <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Εξαγωγή {GREEK_MONTHS[month]} (Τρέχων Μήνας)
                    </button>
                  )}
                  {onExportIcsYear && (
                    <button
                      type="button"
                      onClick={onExportIcsYear}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-2 font-medium text-white shadow-2xs transition"
                    >
                      <Download className="h-4 w-4 text-white" />
                      Εξαγωγή Όλου του {year} (12 Μήνες)
                    </button>
                  )}
                </div>
              </div>

              {/* Schedule 2026 Import / Restore Button */}
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-1.5">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Εισαγωγή Προγράμματος (CSV / Excel)</span>
                  </h5>
                  <p className="text-emerald-700 dark:text-emerald-300 text-xs mt-0.5">
                    Εισαγωγή βαρδιών από αρχείο CSV / Excel ή επαναφορά προκαθορισμένου προγράμματος βαρδιών 2026.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onOpenImportSchedule && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenImportSchedule();
                      }}
                      className="rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 py-2 font-medium text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 transition shadow-2xs"
                    >
                      Εισαγωγή CSV
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onLoadDemoData();
                      onClose();
                    }}
                    className="rounded-lg bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 shadow-2xs transition"
                  >
                    Φόρτωση 2026
                  </button>
                </div>
              </div>

              {/* Danger Zone: Clear Shifts */}
              <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/40 p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 font-semibold text-rose-900 dark:text-rose-200 text-sm">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <span>Εκκαθάριση Όλων των Βαρδιών</span>
                  </div>
                  <p className="text-rose-700 dark:text-rose-300 text-xs mt-0.5">
                    Διαγραφή όλων των καταχωρημένων βαρδιών του έτους.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε όλες τις βάρδιες;')) {
                      onClearAllShifts();
                      onClose();
                    }
                  }}
                  className="rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 px-3 py-2 font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  Καθαρισμός Όλων
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Κλείσιμο
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 active:scale-95 transition"
          >
            <Save className="h-4 w-4" />
            Αποθήκευση Αλλαγών
          </button>
        </div>
      </div>
    </div>
  );
};
