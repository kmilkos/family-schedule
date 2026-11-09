import React, { useState } from 'react';
import { Period, ScheduleSlot } from '../../types';
import { PRIMARY_PERIODS } from '../../data/studentPresets';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  Clock,
  RotateCcw,
  Sun,
  Coffee,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface PeriodManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: Period[];
  schedule?: ScheduleSlot[];
  onSavePeriods: (updatedPeriods: Period[], deletedPeriodIds?: number[]) => void;
  initialEditPeriodId?: number | null;
}

export const PeriodManagerModal: React.FC<PeriodManagerModalProps> = ({
  isOpen,
  onClose,
  periods = [],
  schedule = [],
  onSavePeriods,
  initialEditPeriodId,
}) => {
  const [editingPeriod, setEditingPeriod] = useState<Partial<Period> | null>(() => {
    if (initialEditPeriodId) {
      return periods.find((p) => p.id === initialEditPeriodId) || null;
    }
    return null;
  });

  const initialPeriod = initialEditPeriodId ? periods.find((p) => p.id === initialEditPeriodId) : null;
  const [label, setLabel] = useState(initialPeriod?.label || '');
  const [startTime, setStartTime] = useState(initialPeriod?.startTime || '08:15');
  const [endTime, setEndTime] = useState(initialPeriod?.endTime || '09:00');
  const [breakAfterMinutes, setBreakAfterMinutes] = useState<number>(initialPeriod?.breakAfterMinutes ?? 10);
  const [isAllDay, setIsAllDay] = useState(Boolean(initialPeriod?.isAllDay));

  // Sync state if initialEditPeriodId changes on open
  React.useEffect(() => {
    if (isOpen && initialEditPeriodId) {
      const p = periods.find((item) => item.id === initialEditPeriodId);
      if (p) {
        setEditingPeriod(p);
        setLabel(p.label);
        setStartTime(p.startTime);
        setEndTime(p.endTime);
        setBreakAfterMinutes(p.breakAfterMinutes ?? 0);
        setIsAllDay(Boolean(p.isAllDay));
      }
    }
  }, [isOpen, initialEditPeriodId]);

  if (!isOpen) return null;

  const startEdit = (p: Period) => {
    setEditingPeriod(p);
    setLabel(p.label);
    setStartTime(p.startTime);
    setEndTime(p.endTime);
    setBreakAfterMinutes(p.breakAfterMinutes ?? 0);
    setIsAllDay(p.isAllDay ?? false);
  };

  const startNew = () => {
    // Generate next sensible period id and defaults
    const maxId = periods.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const lastPeriod = periods[periods.length - 1];
    
    let nextStart = '13:20';
    let nextEnd = '14:00';
    if (lastPeriod && lastPeriod.endTime) {
      nextStart = lastPeriod.endTime;
      // Estimate 45 minutes later
      const [h, m] = nextStart.split(':').map(Number);
      const totalM = h * 60 + m + 45;
      const endH = Math.floor(totalM / 60) % 24;
      const endM = totalM % 60;
      nextEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    }

    setEditingPeriod({ id: maxId + 1 });
    setLabel(`${maxId + 1}η Ώρα`);
    setStartTime(nextStart);
    setEndTime(nextEnd);
    setBreakAfterMinutes(10);
    setIsAllDay((maxId + 1) >= 7);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      alert('Παρακαλώ εισάγετε περιγραφή/τίτλο ώρας.');
      return;
    }
    if (!startTime || !endTime) {
      alert('Παρακαλώ εισάγετε ώρα έναρξης και λήξης.');
      return;
    }

    if (editingPeriod && editingPeriod.id !== undefined) {
      const isExisting = periods.some((p) => p.id === editingPeriod.id);
      if (isExisting) {
        // Update existing period
        const updated = periods.map((p) =>
          p.id === editingPeriod.id
            ? {
                ...p,
                label: label.trim(),
                startTime,
                endTime,
                breakAfterMinutes: Number(breakAfterMinutes) || 0,
                isAllDay: Boolean(isAllDay),
              }
            : p
        );
        onSavePeriods(updated);
      } else {
        // Add new period
        const newPeriod: Period = {
          id: editingPeriod.id,
          label: label.trim(),
          startTime,
          endTime,
          breakAfterMinutes: Number(breakAfterMinutes) || 0,
          isAllDay: Boolean(isAllDay),
        };
        const sorted = [...periods, newPeriod].sort((a, b) => a.startTime.localeCompare(b.startTime));
        onSavePeriods(sorted);
      }
    }

    setEditingPeriod(null);
  };

  const handleDelete = (id: number, periodLabel: string) => {
    const slotsUsingThis = schedule.filter((s) => s.periodId === id);
    const count = slotsUsingThis.length;

    let confirmMsg = `Είστε σίγουροι ότι θέλετε να διαγράψετε τη διδακτική ώρα "${periodLabel}";`;
    if (count > 0) {
      confirmMsg += `\n\nΠΡΟΣΟΧΗ: Υπάρχουν ${count} μαθήματα καταχωρημένα σε αυτή την ώρα στο εβδομαδιαίο πρόγραμμα. Οι ώρες αυτές θα αδειάσουν.`;
    }

    if (window.confirm(confirmMsg)) {
      const updated = periods.filter((p) => p.id !== id);
      onSavePeriods(updated, [id]);
      if (editingPeriod?.id === id) setEditingPeriod(null);
    }
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Επαναφορά στο επίσημο ωράριο Δημοτικού Σχολείου (ΥΠΑΙΘ);\n\nΑυτό θα επαναφέρει τις 6 πρωινές ώρες και τις 4 ώρες του ολοημέρου στα προκαθορισμένα ωράρια.'
      )
    ) {
      onSavePeriods(PRIMARY_PERIODS);
      setEditingPeriod(null);
    }
  };

  // Helper to compute duration in minutes
  const calculateDuration = (start: string, end: string): number => {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      return eh * 60 + em - (sh * 60 + sm);
    } catch {
      return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              ⏱️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingPeriod
                  ? editingPeriod.id && !periods.some((p) => p.id === editingPeriod.id)
                    ? 'Προσθήκη Νέας Διδακτικής Ώρας'
                    : 'Επεξεργασία Διδακτικής Ώρας'
                  : 'Διαχείριση Διδακτικών Ωρών & Ωραρίου'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ρύθμιση ωραρίου μαθημάτων, έναρξης/λήξης, διαλειμμάτων και ολοημέρου
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {editingPeriod ? (
            /* Edit / Create Period Form */
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPeriod(null)}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Πίσω στις ώρες
                </button>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {editingPeriod.id && !periods.some((p) => p.id === editingPeriod.id)
                    ? '+ Νέα Ώρα'
                    : 'Επεξεργασία'}
                </span>
              </div>

              {/* Title / Label */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Τίτλος / Ονομασία Ώρας</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="π.χ. 1η Ώρα, 7η Ώρα (Σίτιση), Πρωινή Ζώνη"
                  required
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Start Time & End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ώρα Έναρξης</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ώρα Λήξης</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Duration Preview */}
              {startTime && endTime && (
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 px-1">
                  <span>Διάρκεια μαθήματος:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {calculateDuration(startTime, endTime)} λεπτά
                  </span>
                </div>
              )}

              {/* Break after minutes */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-500" />
                  <span>Διάλειμμα μετά το μάθημα (λεπτά)</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={breakAfterMinutes}
                    onChange={(e) => setBreakAfterMinutes(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15, 20].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setBreakAfterMinutes(mins)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          breakAfterMinutes === mins
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {mins === 0 ? 'Χωρίς' : `${mins}'`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* All-Day Program Toggle */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ώρα Ολοημέρου Προγράμματος</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Ενεργοποιήστε αν αυτή η ώρα ανήκει στο απογευματινό ολοήμερο πρόγραμμα (εμφανίζεται όταν είναι ενεργό το ολοήμερο).
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="sticky -bottom-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-3 pb-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 -mx-6 px-6 shadow-xl">
                <button
                  type="button"
                  onClick={() => setEditingPeriod(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Αποθήκευση Ώρας</span>
                </button>
              </div>
            </form>
          ) : (
            /* Periods List */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Διδακτικές Ώρες ({periods.length})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Καθορίζουν τις γραμμές και τα χρονικά διαστήματα του ωρολογίου προγράμματος
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    title="Επαναφορά προκαθορισμένου ωραρίου ΥΠΑΙΘ"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Πρότυπο ΥΠΑΙΘ</span>
                  </button>
                  <button
                    type="button"
                    onClick={startNew}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Νέα Ώρα</span>
                  </button>
                </div>
              </div>

              {periods.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                  <div className="text-4xl">⏱️</div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                      Δεν υπάρχουν καταχωρημένες διδακτικές ώρες
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Μπορείτε να προσθέσετε χειροκίνητα ώρες ή να επαναφέρετε το επίσημο πρόγραμμα Δημοτικού.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Επαναφορά προτύπου Δημοτικού (ΥΠΑΙΘ)</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {periods.map((p) => {
                    const scheduledCount = schedule.filter((s) => s.periodId === p.id).length;
                    const duration = calculateDuration(p.startTime, p.endTime);
                    const isAllDayPeriod = p.isAllDay || p.id >= 7;

                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs dark:shadow-md"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-mono shrink-0 shadow-inner border ${
                              isAllDayPeriod
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
                                : 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {p.id}η
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {p.label}
                              </h5>
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                {p.startTime} – {p.endTime}
                              </span>
                              {isAllDayPeriod && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                  ☀️ Ολοήμερο
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                              <span>Διάρκεια: <strong>{duration} λεπτά</strong></span>
                              {(p.breakAfterMinutes ?? 0) > 0 ? (
                                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                                  <Coffee className="w-3 h-3" />
                                  <span>Διάλειμμα: {p.breakAfterMinutes}&apos;</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">Χωρίς διάλειμμα</span>
                              )}
                              {(scheduledCount ?? 0) > 0 && (
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                  • {scheduledCount} μαθήματα καταχωρημένα
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Επεξεργασία ώρας"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.label)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-500/30 transition-colors cursor-pointer"
                            title="Διαγραφή ώρας"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {periods.length} ώρες στο πρόγραμμα
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  );
};
