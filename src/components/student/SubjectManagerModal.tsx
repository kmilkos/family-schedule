import React, { useState } from 'react';
import { Subject, ScheduleSlot } from '../../types';
import { COLOR_PALETTE } from '../../data/studentPresets';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  MapPin,
  User,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Search,
  Hash,
} from 'lucide-react';

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  schedule?: ScheduleSlot[];
  onSaveSubjects: (updatedSubjects: Subject[], deletedSubjectIds?: string[]) => void;
  initialEditSubjectId?: string | null;
}

const COMMON_SUBJECT_EMOJIS = [
  '📖', '📐', '🏛️', '🌱', '🔬', '🇬🇧', '🇫🇷', '🇩🇪',
  '💻', '⚽', '🎨', '🎵', '🎭', '🕊️', '💡', '🤖',
  '♟️', '📚', '🍲', '🌟', '✍️', '🌍', '⚖️', '🏊'
];

export const PRESET_SUBJECTS: Omit<Subject, 'id'>[] = [
  { name: 'Γλώσσα', code: 'ΓΛΩ', color: '#3b82f6', bgLight: '#eff6ff', borderColor: '#93c5fd', icon: '📖' },
  { name: 'Μαθηματικά', code: 'ΜΑΘ', color: '#10b981', bgLight: '#ecfdf5', borderColor: '#6ee7b7', icon: '📐' },
  { name: 'Ιστορία', code: 'ΙΣΤ', color: '#f59e0b', bgLight: '#fffbeb', borderColor: '#fcd34d', icon: '🏛️' },
  { name: 'Μελέτη Περιβάλλοντος', code: 'ΜΕΛ', color: '#84cc16', bgLight: '#f7fee7', borderColor: '#bef264', icon: '🌱' },
  { name: 'Φυσικά', code: 'ΦΥΣ', color: '#06b6d4', bgLight: '#ecfeff', borderColor: '#67e8f9', icon: '🔬' },
  { name: 'Αγγλικά', code: 'ΑΓΓ', color: '#6366f1', bgLight: '#eef2ff', borderColor: '#a5b4fc', icon: '🇬🇧' },
  { name: 'Γαλλικά', code: 'ΓΑΛ', color: '#8b5cf6', bgLight: '#f5f3ff', borderColor: '#c4b5fd', icon: '🇫🇷' },
  { name: 'Γερμανικά', code: 'ΓΕΡ', color: '#d97706', bgLight: '#fffbeb', borderColor: '#fde68a', icon: '🇩🇪' },
  { name: 'Πληροφορική (ΤΠΕ)', code: 'ΤΠΕ', color: '#0284c7', bgLight: '#f0f9ff', borderColor: '#7dd3fc', icon: '💻', defaultRoom: 'Εργαστήριο Η/Υ' },
  { name: 'Φυσική Αγωγή (Γυμναστική)', code: 'ΓΥΜ', color: '#ec4899', bgLight: '#fdf2f8', borderColor: '#f472b6', icon: '⚽', defaultRoom: 'Γήπεδο' },
  { name: 'Εικαστικά', code: 'ΕΙΚ', color: '#f97316', bgLight: '#fff7ed', borderColor: '#fdba74', icon: '🎨' },
  { name: 'Μουσική', code: 'ΜΟΥ', color: '#d946ef', bgLight: '#fdf4ff', borderColor: '#f0abfc', icon: '🎵', defaultRoom: 'Αίθουσα Μουσικής' },
  { name: 'Θεατρική Αγωγή', code: 'ΘΕΑ', color: '#14b8a6', bgLight: '#f0fdfa', borderColor: '#5eead4', icon: '🎭' },
  { name: 'Θρησκευτικά', code: 'ΘΡΗ', color: '#64748b', bgLight: '#f8fafc', borderColor: '#cbd5e1', icon: '🕊️' },
  { name: 'Εργαστήρια Δεξιοτήτων', code: 'ΔΕΞ', color: '#0ea5e9', bgLight: '#f0f9ff', borderColor: '#bae6fd', icon: '💡' },
  { name: 'Κοινωνική & Πολιτική Αγωγή', code: 'ΚΠΑ', color: '#0284c7', bgLight: '#f0f9ff', borderColor: '#7dd3fc', icon: '⚖️' },
  { name: 'Γεωγραφία', code: 'ΓΕΩ', color: '#10b981', bgLight: '#ecfdf5', borderColor: '#6ee7b7', icon: '🌍' },
  { name: 'Ρομποτική & STEM', code: 'ΡΟΜΠ', color: '#0284c7', bgLight: '#f0f9ff', borderColor: '#7dd3fc', icon: '🤖', defaultRoom: 'Εργαστήριο STEM' },
  { name: 'Σκάκι', code: 'ΣΚΑΚ', color: '#475569', bgLight: '#f8fafc', borderColor: '#cbd5e1', icon: '♟️' },
  { name: 'Σίτιση / Γεύμα (Ολοήμερο)', code: 'ΣΙΤ', color: '#f59e0b', bgLight: '#fffbeb', borderColor: '#fcd34d', icon: '🍲', defaultRoom: 'Τραπεζαρία' },
  { name: 'Μελέτη - Προετοιμασία (Ολοήμερο)', code: 'ΜΕΛ-ΟΛ', color: '#10b981', bgLight: '#ecfdf5', borderColor: '#6ee7b7', icon: '📚', defaultRoom: 'Αίθουσα Μελέτης' },
  { name: 'Δραστηριότητες Ολοημέρου', code: 'ΔΡΑΣ', color: '#8b5cf6', bgLight: '#f5f3ff', borderColor: '#c4b5fd', icon: '🎨' },
  { name: 'Μαθητικοί Όμιλοι (Διευρυμένο)', code: 'ΟΜΙΛ', color: '#06b6d4', bgLight: '#ecfeff', borderColor: '#67e8f9', icon: '🌟' },
];

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({
  isOpen,
  onClose,
  subjects = [],
  schedule = [],
  onSaveSubjects,
  initialEditSubjectId,
}) => {
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(() => {
    if (initialEditSubjectId) {
      return subjects.find((s) => s.id === initialEditSubjectId) || null;
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [icon, setIcon] = useState('📖');
  const [color, setColor] = useState(COLOR_PALETTE[0].hex); // Blue default
  const [defaultTeacher, setDefaultTeacher] = useState('');
  const [defaultRoom, setDefaultRoom] = useState('');

  if (!isOpen) return null;

  const startEdit = (subj: Subject) => {
    setEditingSubject(subj);
    setName(subj.name);
    setCode(subj.code || '');
    setIcon(subj.icon || '📖');
    setColor(subj.color);
    setDefaultTeacher(subj.defaultTeacher || '');
    setDefaultRoom(subj.defaultRoom || '');
  };

  const startNew = () => {
    setEditingSubject({ id: 'new' });
    setName('');
    setCode('');
    setIcon('📖');
    setColor(COLOR_PALETTE[0].hex);
    setDefaultTeacher('');
    setDefaultRoom('');
  };

  const applyPreset = (preset: (typeof PRESET_SUBJECTS)[0]) => {
    setName(preset.name);
    setCode(preset.code || '');
    setIcon(preset.icon || '📖');
    setColor(preset.color);
    if (preset.defaultRoom) setDefaultRoom(preset.defaultRoom);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Παρακαλώ εισάγετε όνομα μαθήματος.');
      return;
    }

    const paletteItem = COLOR_PALETTE.find((c) => c.hex.toLowerCase() === color.toLowerCase()) || COLOR_PALETTE[0];

    if (editingSubject && editingSubject.id && editingSubject.id !== 'new') {
      // Update existing subject
      const updated = subjects.map((s) =>
        s.id === editingSubject.id
          ? {
              ...s,
              name: name.trim(),
              code: code.trim().toUpperCase() || undefined,
              icon,
              color,
              bgLight: paletteItem.bgLight,
              borderColor: paletteItem.border,
              defaultTeacher: defaultTeacher.trim() || undefined,
              defaultRoom: defaultRoom.trim() || undefined,
            }
          : s
      );
      onSaveSubjects(updated);
    } else {
      // Create new subject
      const newSubject: Subject = {
        id: 'subj-' + Date.now(),
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        icon,
        color,
        bgLight: paletteItem.bgLight,
        borderColor: paletteItem.border,
        defaultTeacher: defaultTeacher.trim() || undefined,
        defaultRoom: defaultRoom.trim() || undefined,
      };
      onSaveSubjects([...subjects, newSubject]);
    }

    setEditingSubject(null);
  };

  const handleDelete = (id: string, subjName: string) => {
    const slotsUsingThis = schedule.filter((s) => s.subjectId === id);
    const count = slotsUsingThis.length;

    let confirmMsg = `Είστε σίγουροι ότι θέλετε να διαγράψετε το μάθημα "${subjName}";`;
    if (count > 0) {
      confirmMsg += `\n\nΠΡΟΣΟΧΗ: Το μάθημα είναι τοποθετημένο σε ${count} ${count === 1 ? 'ώρα' : 'ώρες'} στο εβδομαδιαίο πρόγραμμα. Οι ώρες αυτές θα αδειάσουν αυτόματα.`;
    }

    if (window.confirm(confirmMsg)) {
      const updated = subjects.filter((s) => s.id !== id);
      onSaveSubjects(updated, [id]);
      if (editingSubject?.id === id) setEditingSubject(null);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.defaultTeacher && s.defaultTeacher.toLowerCase().includes(q)) ||
      (s.defaultRoom && s.defaultRoom.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-xl shadow-inner">
              📚
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingSubject
                  ? editingSubject.id === 'new'
                    ? 'Προσθήκη Νέου Μαθήματος'
                    : 'Επεξεργασία Μαθήματος'
                  : 'Διαχείριση Σχολικών Μαθημάτων'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Προσθήκη, αλλαγή στοιχείων και διαγραφή μαθημάτων για το ωρολόγιο πρόγραμμα
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
          {editingSubject ? (
            /* Edit / Create Form */
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Πίσω στη λίστα μαθημάτων
                </button>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {editingSubject.id === 'new' ? '+ Νέο Μάθημα' : 'Επεξεργασία'}
                </span>
              </div>

              {/* Ready Presets Bar */}
              <div className="bg-slate-50 dark:bg-slate-950/70 border border-blue-500/20 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Γρήγορα Έτοιμα Πρότυπα (1-κλικ αυτόματη συμπλήρωση):</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pt-1">
                  {PRESET_SUBJECTS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 hover:border-blue-500/80 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <span className="text-sm">{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Name, Code & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span>Όνομα Μαθήματος</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="π.χ. Γερμανικά, Ρομποτική, Γλώσσα"
                    required
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span>Κωδικός</span>
                    <span className="text-[10px] text-slate-400 font-normal">(προαιρετικό)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="π.χ. ΓΕΡ"
                    className="w-full px-3 py-2 text-sm font-mono uppercase bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Emoji / Εικονίδιο</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-14 px-2 py-2 text-center text-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {COMMON_SUBJECT_EMOJIS.slice(0, 4).map((em) => (
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

              {/* Extended Emoji Palette */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Περισσότερα δημοφιλή εικονίδια:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SUBJECT_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-8 h-8 rounded-lg border text-base flex items-center justify-center transition-all cursor-pointer ${
                        icon === em
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 scale-110 ring-2 ring-blue-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>Χρώμα Μαθήματος</span>
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs"
                    style={{ backgroundColor: color }}
                  />
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {COLOR_PALETTE.map((c) => {
                    const isSelected = c.hex.toLowerCase() === color.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setColor(c.hex)}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-blue-500 border-blue-500 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-950'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate text-slate-700 dark:text-slate-300 text-[11px]">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teacher and Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Προκαθορισμένος Εκπαιδευτικός / Δάσκαλος</span>
                  </label>
                  <input
                    type="text"
                    value={defaultTeacher}
                    onChange={(e) => setDefaultTeacher(e.target.value)}
                    placeholder="π.χ. κα. Μαρία, κος Κώστας"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>Προκαθορισμένη Αίθουσα</span>
                  </label>
                  <input
                    type="text"
                    value={defaultRoom}
                    onChange={(e) => setDefaultRoom(e.target.value)}
                    placeholder="π.χ. Τάξη Β1, Εργαστήριο Η/Υ, Γήπεδο"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Προεπισκόπηση Κάρτας στο Ωρολόγιο Πρόγραμμα:
                </span>
                <div
                  style={{
                    backgroundColor: `${color}20`,
                    borderColor: `${color}50`,
                  }}
                  className="p-3 rounded-xl border flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{icon || '📚'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {name.trim() || 'Όνομα Μαθήματος'}
                        </span>
                        {code.trim() && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-white"
                            style={{ backgroundColor: color }}
                          >
                            {code.trim().toUpperCase()}
                          </span>
                        )}
                      </div>
                      {(defaultTeacher.trim() || defaultRoom.trim()) && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-0.5">
                          {defaultTeacher.trim() && <span>👤 {defaultTeacher.trim()}</span>}
                          {defaultRoom.trim() && <span>📍 {defaultRoom.trim()}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky -bottom-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-3 pb-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 -mx-6 px-6 shadow-xl">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Αποθήκευση Μαθήματος</span>
                </button>
              </div>
            </form>
          ) : (
            /* Subjects List */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Ενεργά Μαθήματα ({subjects.length})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Εμφανίζονται στην παλέτα επιλογής και στις ώρες του ωρολογίου προγράμματος
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startNew}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Νέο Μάθημα</span>
                </button>
              </div>

              {/* Search Bar */}
              {(subjects.length ?? 0) > 5 && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Αναζήτηση μαθήματος, κωδικού ή δασκάλου..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {filteredSubjects.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                  <div className="text-4xl">📚</div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                      {searchQuery ? 'Δεν βρέθηκαν μαθήματα με αυτή την αναζήτηση' : 'Δεν υπάρχουν καταχωρημένα μαθήματα'}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Προσθέστε μαθήματα (Γλώσσα, Μαθηματικά, Γερμανικά, Ρομποτική κ.α.) για να δημιουργήσετε το ωρολόγιο πρόγραμμα.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startNew}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Προσθήκη πρώτου μαθήματος</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredSubjects.map((subj) => {
                    const scheduledHours = schedule.filter((s) => s.subjectId === subj.id).length;
                    return (
                      <div
                        key={subj.id}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs dark:shadow-md"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner border border-slate-200 dark:border-white/10"
                            style={{ backgroundColor: `${subj.color}20`, color: subj.color }}
                          >
                            {subj.icon || '📚'}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{subj.name}</h5>
                              {subj.code && (
                                <span
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-white dark:text-slate-950 uppercase tracking-wider shadow-2xs"
                                  style={{ backgroundColor: subj.color }}
                                >
                                  {subj.code}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${
                                  (scheduledHours ?? 0) > 0
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {(scheduledHours ?? 0) > 0
                                  ? `${scheduledHours} ${scheduledHours === 1 ? 'ώρα' : 'ώρες'} / εβδομάδα`
                                  : 'Δεν έχει τοποθετηθεί'}
                              </span>
                            </div>

                            {/* Teacher & Room */}
                            {(subj.defaultTeacher || subj.defaultRoom) && (
                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                {subj.defaultTeacher && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-blue-500" />
                                    <span>{subj.defaultTeacher}</span>
                                  </span>
                                )}
                                {subj.defaultRoom && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-blue-500" />
                                    <span>{subj.defaultRoom}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(subj)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Επεξεργασία μαθήματος"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(subj.id, subj.name)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-500/30 transition-colors cursor-pointer"
                            title="Διαγραφή μαθήματος"
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
            {subjects.length} μαθήματα διαθέσιμα
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
