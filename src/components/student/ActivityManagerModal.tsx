import React, { useState } from 'react';
import { AfternoonActivity, DayOfWeek } from '../../types';
import { DAYS, COLOR_PALETTE, PRESET_AFTERNOON_ACTIVITIES } from '../../data/studentPresets';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  MapPin,
  User,
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  FileText,
} from 'lucide-react';

interface ActivityManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: AfternoonActivity[];
  onSaveActivities: (updatedActivities: AfternoonActivity[]) => void;
  initialEditActivityId?: string | null;
}

const COMMON_ACTIVITY_EMOJIS = [
  '🏃', '🇬🇧', '🏊', '🏀', '⚽', '🎹', '🤖', '🥋',
  '🩰', '📚', '♟️', '🎾', '🏐', '🎨', '🎸', '🧗'
];

export const ActivityManagerModal: React.FC<ActivityManagerModalProps> = ({
  isOpen,
  onClose,
  activities = [],
  onSaveActivities,
  initialEditActivityId,
}) => {
  const [editingActivity, setEditingActivity] = useState<Partial<AfternoonActivity> | null>(() => {
    if (initialEditActivityId) {
      return activities.find((a) => a.id === initialEditActivityId) || null;
    }
    return null;
  });

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏃');
  const [color, setColor] = useState(COLOR_PALETTE[6].hex); // Orange default for activities
  const [days, setDays] = useState<DayOfWeek[]>(['monday', 'wednesday']);
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [instructor, setInstructor] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const startEdit = (act: AfternoonActivity) => {
    setEditingActivity(act);
    setName(act.name);
    setIcon(act.icon || '🏃');
    setColor(act.color);
    setDays(act.days || []);
    setStartTime(act.startTime);
    setEndTime(act.endTime);
    setLocation(act.location || '');
    setInstructor(act.instructor || '');
    setNotes(act.notes || '');
  };

  const startNew = () => {
    setEditingActivity({ id: 'new' });
    setName('');
    setIcon('🏃');
    setColor(COLOR_PALETTE[6].hex);
    setDays(['monday', 'wednesday']);
    setStartTime('17:30');
    setEndTime('19:00');
    setLocation('');
    setInstructor('');
    setNotes('');
  };

  const applyPreset = (preset: (typeof PRESET_AFTERNOON_ACTIVITIES)[0]) => {
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
    setDays(preset.days);
    setStartTime(preset.startTime);
    setEndTime(preset.endTime);
    setLocation(preset.location || '');
    setInstructor(preset.instructor || '');
    setNotes(preset.notes || '');
  };

  const toggleDay = (dayId: DayOfWeek) => {
    if (days.includes(dayId)) {
      setDays(days.filter((d) => d !== dayId));
    } else {
      setDays([...days, dayId]);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Παρακαλώ εισάγετε όνομα δραστηριότητας.');
      return;
    }
    if (days.length === 0) {
      alert('Παρακαλώ επιλέξτε τουλάχιστον μία ημέρα.');
      return;
    }

    const paletteItem = COLOR_PALETTE.find((c) => c.hex === color) || COLOR_PALETTE[6];

    if (editingActivity && editingActivity.id && editingActivity.id !== 'new') {
      // Update existing
      const updated = activities.map((a) =>
        a.id === editingActivity.id
          ? {
              ...a,
              name: name.trim(),
              icon,
              color,
              bgLight: paletteItem.bgLight,
              borderColor: paletteItem.border,
              days,
              startTime,
              endTime,
              location: location.trim() || undefined,
              instructor: instructor.trim() || undefined,
              notes: notes.trim() || undefined,
            }
          : a
      );
      onSaveActivities(updated);
    } else {
      // Create new
      const newAct: AfternoonActivity = {
        id: 'act-' + Date.now(),
        name: name.trim(),
        icon,
        color,
        bgLight: paletteItem.bgLight,
        borderColor: paletteItem.border,
        days,
        startTime,
        endTime,
        location: location.trim() || undefined,
        instructor: instructor.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      onSaveActivities([...activities, newAct]);
    }

    setEditingActivity(null);
  };

  const handleDelete = (id: string, actName: string) => {
    if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τη δραστηριότητα "${actName}";`)) {
      const updated = activities.filter((a) => a.id !== id);
      onSaveActivities(updated);
      if (editingActivity?.id === id) setEditingActivity(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              🌅
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingActivity
                  ? editingActivity.id === 'new'
                    ? 'Προσθήκη Απογευματινής Δραστηριότητας'
                    : 'Επεξεργασία Δραστηριότητας'
                  : 'Απογευματινές Δραστηριότητες & Εξωσχολικά'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Στίβος, αγγλικά, αθλήματα, μουσική, φροντιστήριο & εξωσχολικά
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
          {editingActivity ? (
            /* Edit / Create Form */
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Πίσω στη λίστα
                </button>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {editingActivity.id === 'new' ? '+ Νέα Δραστηριότητα' : 'Επεξεργασία'}
                </span>
              </div>

              {/* Ready Presets Bar */}
              <div className="bg-slate-50 dark:bg-slate-950/70 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Γρήγορα Έτοιμα Πρότυπα (1-κλικ αυτόματη συμπλήρωση):</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pt-1">
                  {PRESET_AFTERNOON_ACTIVITIES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 hover:border-amber-500/80 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <span className="text-sm">{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Name & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span>Όνομα Δραστηριότητας</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="π.χ. Στίβος, Αγγλικά, Κολύμβηση"
                    required
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Εικονίδιο / Emoji</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-14 px-2 py-2 text-center text-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {COMMON_ACTIVITY_EMOJIS.slice(0, 6).map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setIcon(em)}
                          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60 flex items-center justify-center text-base transition-transform hover:scale-110 cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Days Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Ημέρες Διεξαγωγής <span className="text-rose-500">*</span></span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {DAYS.map((d) => {
                    const isSelected = days.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDay(d.id)}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black border-amber-500 shadow-md shadow-amber-500/20'
                            : 'bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {d.shortName}
                        <div className="text-[10px] font-normal opacity-90">{d.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours: Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Ώρα Έναρξης</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Ώρα Λήξης</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Location & Coach/Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Τοποθεσία / Γήπεδο / Χώρος</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="π.χ. Δημοτικό Στάδιο, Κολυμβητήριο"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Υπεύθυνος / Προπονητής / Καθηγητής</span>
                  </label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="π.χ. Προπονητής: κ. Κώστας"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Σημειώσεις / Απαραίτητος Εξοπλισμός</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="π.χ. Αθλητικά παπούτσια, παγούρι νερό, Coursebook"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Χρώμα Επισήμανσης</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        color === c.hex
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-900 dark:ring-white scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons (Sticky at bottom of form) */}
              <div className="sticky -bottom-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-3 pb-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 -mx-6 px-6 shadow-xl">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Αποθήκευση Δραστηριότητας</span>
                </button>
              </div>
            </form>
          ) : (
            /* Activities List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Ενεργές Απογευματινές Δραστηριότητες ({activities.length})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Εμφανίζονται στο εβδομαδιαίο ωρολόγιο πρόγραμμα και στην εκτύπωση
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startNew}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Νέα Δραστηριότητα</span>
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                  <div className="text-4xl">🏃‍♂️</div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                      Δεν υπάρχουν ακόμη απογευματινές δραστηριότητες
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Προσθέστε στίβο, αγγλικά, κολύμβηση, μουσική ή οποιαδήποτε εξωσχολική δραστηριότητα για πλήρες πρόγραμμα ημέρας!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startNew}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Προσθήκη πρώτης δραστηριότητας</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs dark:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner border border-slate-200 dark:border-white/10"
                          style={{ backgroundColor: `${act.color}20`, color: act.color }}
                        >
                          {act.icon || '🏃'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{act.name}</h5>
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white dark:text-slate-950 uppercase tracking-wider font-mono shadow-xs"
                              style={{ backgroundColor: act.color }}
                            >
                              {act.startTime} - {act.endTime}
                            </span>
                          </div>

                          {/* Days badges */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {act.days?.map((dayId) => {
                              const dayObj = DAYS.find((d) => d.id === dayId);
                              return (
                                <span
                                  key={dayId}
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                                >
                                  {dayObj ? dayObj.shortName : dayId}
                                </span>
                              );
                            })}
                          </div>

                          {/* Location & Instructor */}
                          {(act.location || act.instructor) && (
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                              {act.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>{act.location}</span>
                                </span>
                              )}
                              {act.instructor && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>{act.instructor}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {act.notes && (
                            <div className="text-[11px] text-amber-800 dark:text-amber-300/80 italic bg-amber-50 dark:bg-amber-500/5 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/15">
                              💡 {act.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(act)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                          title="Επεξεργασία"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(act.id, act.name)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-500/30 transition-colors cursor-pointer"
                          title="Διαγραφή"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {activities.length} δραστηριότητες στο πρόγραμμα
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
