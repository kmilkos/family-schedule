import React, { useState } from 'react';
import { CalendarType, UserAccount, UserCalendar, WorkArrangement, WORK_ARRANGEMENTS } from '../../types';
import { Calendar, Plus, Trash2, Edit3, X, Check, Eye, EyeOff, Briefcase, GraduationCap, Clock } from 'lucide-react';

interface CalendarManagerModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  calendars: UserCalendar[];
  onRefreshCalendars: () => void;
  onClose: () => void;
}

const COLOR_OPTIONS = ['#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1', '#14b8a6'];

export const CalendarManagerModal: React.FC<CalendarManagerModalProps> = ({
  isOpen,
  user,
  calendars,
  onRefreshCalendars,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCalId, setEditingCalId] = useState<string | null>(null);

  // Form State
  const [calName, setCalName] = useState('');
  const [calType, setCalType] = useState<CalendarType>('WORK_SHIFTS');
  const [calColor, setCalColor] = useState('#3b82f6');
  const [isShared, setIsShared] = useState(true);
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement>('full_time');
  const [jobTitle, setJobTitle] = useState('');
  const [contractHours, setContractHours] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const userCalendars = calendars.filter((c) => c.userId === user.id);

  const resetForm = () => {
    setIsAdding(false);
    setEditingCalId(null);
    setCalName('');
    setCalType('WORK_SHIFTS');
    setCalColor('#3b82f6');
    setIsShared(true);
    setWorkArrangement('full_time');
    setJobTitle('');
    setContractHours(8);
    setError(null);
  };

  const startEdit = (cal: UserCalendar) => {
    setEditingCalId(cal.id);
    setIsAdding(false);
    setCalName(cal.name);
    setCalType(cal.type);
    setCalColor(cal.color);
    setIsShared(cal.isSharedWithFamily);
    setWorkArrangement(cal.workArrangement || 'full_time');
    setJobTitle(cal.jobTitle || '');
    setContractHours(cal.contractHours || 8);
    setError(null);
  };

  const handleSaveCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calName.trim()) {
      setError('Παρακαλώ εισάγετε όνομα ημερολογίου.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = localStorage.getItem('family_schedule_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let url = '/api/calendars';
      let method = 'POST';

      const payload: any = {
        userId: user.id,
        name: calName.trim(),
        type: calType,
        color: calColor,
        isSharedWithFamily: isShared,
        workArrangement: calType === 'WORK_SHIFTS' ? workArrangement : undefined,
        jobTitle: calType === 'WORK_SHIFTS' ? (jobTitle.trim() || undefined) : undefined,
        contractHours: calType === 'WORK_SHIFTS' ? contractHours : undefined,
      };

      if (editingCalId) {
        url = `/api/calendars/${editingCalId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Σφάλμα αποθήκευσης');

      onRefreshCalendars();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Αποτυχία');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCalendar = async (calId: string, name: string) => {
    if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το ημερολόγιο "${name}";`)) return;

    try {
      const token = localStorage.getItem('family_schedule_token');
      const res = await fetch(`/api/calendars/${calId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Σφάλμα διαγραφής');
      onRefreshCalendars();
    } catch (err: any) {
      alert(err.message || 'Αποτυχία διαγραφής');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Ημερολόγια: {user.displayName}
              </h3>
              <p className="text-xs text-slate-400">Διαχείριση πολλαπλών ημερολογίων & μορφών απασχόλησης</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Add / Edit Form */}
          {(isAdding || editingCalId) ? (
            <form onSubmit={handleSaveCalendar} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {editingCalId ? 'Επεξεργασία Ημερολογίου' : 'Προσθήκη Νέου Ημερολογίου'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Ακύρωση
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Όνομα Ημερολογίου
                  </label>
                  <input
                    type="text"
                    required
                    value={calName}
                    onChange={(e) => setCalName(e.target.value)}
                    placeholder="π.χ. Βάρδιες, Ραντεβού, Σχολείο"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Τύπος Ημερολογίου
                  </label>
                  <select
                    value={calType}
                    disabled={Boolean(editingCalId)}
                    onChange={(e) => setCalType(e.target.value as CalendarType)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                  >
                    <option value="WORK_SHIFTS">💼 Βάρδιες & Υπερωρίες (Υπολογισμοί Εργασίας)</option>
                    <option value="STUDENT_SCHEDULE">🎒 Σχολείο & Δραστηριότητες (Ωρολόγιο/Καθήκοντα)</option>
                    <option value="GENERIC_EVENTS">📅 Γενικά Γεγονότα / Προσωπικά Ραντεβού</option>
                  </select>
                </div>
              </div>

              {/* Specific Options for WORK_SHIFTS */}
              {calType === 'WORK_SHIFTS' && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                    Μορφή Εργασίας / Σύμβασης
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Τύπος Απασχόλησης
                      </label>
                      <select
                        value={workArrangement}
                        onChange={(e) => setWorkArrangement(e.target.value as WorkArrangement)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                      >
                        {WORK_ARRANGEMENTS.map((wa) => (
                          <option key={wa.key} value={wa.key}>
                            {wa.icon} {wa.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Τίτλος / Θέση Εργασίας (Προαιρετικό)
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="π.χ. Τεχνικός, Υπάλληλος Γραφείου"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Contract Hours buttons */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Βασικό Ημερήσιο Ωράριο Σύμβασης
                    </label>
                    <div className="flex gap-2">
                      {[4, 6, 8].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setContractHours(h)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            contractHours === h
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {h}ωρο
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Color & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Χρώμα Ημερολογίου
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCalColor(c)}
                        className={`w-6 h-6 rounded-full transition cursor-pointer border-2 ${
                          calColor === c ? 'border-slate-900 dark:border-white scale-110 shadow-xs' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Ορατότητα στην Οικογένεια
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsShared(!isShared)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      isShared
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isShared ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    <span>{isShared ? 'Κοινόχρηστο στο Οικογενειακό Ταμπλό' : 'Ιδιωτικό (Μόνο για εσάς)'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Αποθήκευση...' : 'Αποθήκευση Ημερολογίου'}</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Δημιουργία Νέου Ημερολογίου</span>
            </button>
          )}

          {/* User's Calendars List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Ενεργά Ημερολόγια ({userCalendars.length})
            </span>
            {userCalendars.map((c) => {
              const wa = WORK_ARRANGEMENTS.find((w) => w.key === c.workArrangement);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {c.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.type === 'WORK_SHIFTS' ? 'Βάρδιες' : c.type === 'STUDENT_SCHEDULE' ? 'Σχολείο' : 'Γενικά'}
                        </span>
                        {c.isSharedWithFamily ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Κοινόχρηστο
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Ιδιωτικό
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {c.type === 'WORK_SHIFTS' && (
                          <span>
                            {wa?.icon} {wa?.label || 'Πλήρης απασχόληση'} • {c.contractHours || 8}ωρο
                            {c.jobTitle ? ` (${c.jobTitle})` : ''}
                          </span>
                        )}
                        {c.type === 'STUDENT_SCHEDULE' && 'Ωρολόγιο μαθημάτων & εξωσχολικές δραστηριότητες'}
                        {c.type === 'GENERIC_EVENTS' && 'Προσωπικά ραντεβού & υποχρεώσεις'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Επεξεργασία"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {userCalendars.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCalendar(c.id, c.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Διαγραφή"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  );
};
