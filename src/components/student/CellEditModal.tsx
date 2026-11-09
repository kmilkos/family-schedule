import React, { useState, useEffect } from 'react';
import { Subject, Period, DayOfWeek, ScheduleSlot } from '../../types';
import { DAYS } from '../../data/studentPresets';
import { X, Trash2, Check, Clock, MapPin, User, FileText } from 'lucide-react';

interface CellEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayOfWeek;
  period: Period;
  currentSlot?: ScheduleSlot;
  subjects: Subject[];
  onSave: (updatedSlot: ScheduleSlot | null) => void;
}

export const CellEditModal: React.FC<CellEditModalProps> = ({
  isOpen,
  onClose,
  day,
  period,
  currentSlot,
  subjects,
  onSave,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [teacher, setTeacher] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedSubjectId(currentSlot?.subjectId || '');
      setTeacher(currentSlot?.teacher || '');
      setRoom(currentSlot?.room || '');
      setNote(currentSlot?.note || '');
    }
  }, [isOpen, currentSlot]);

  if (!isOpen) return null;

  const dayInfo = DAYS.find((d) => d.id === day);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    if (subjectId) {
      const subj = subjects.find((s) => s.id === subjectId);
      if (subj) {
        if (!teacher && subj.defaultTeacher) setTeacher(subj.defaultTeacher);
        if (!room && subj.defaultRoom) setRoom(subj.defaultRoom);
      }
    }
  };

  const handleSave = () => {
    if (!selectedSubjectId) {
      // Clear slot
      onSave(null);
      onClose();
      return;
    }

    const updated: ScheduleSlot = {
      day,
      periodId: period.id,
      subjectId: selectedSubjectId,
      teacher: teacher.trim() || undefined,
      room: room.trim() || undefined,
      note: note.trim() || undefined,
    };
    onSave(updated);
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{dayInfo?.name}</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">•</span>
              <span className="text-amber-600 dark:text-amber-400">{period.label}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>
                {period.startTime} - {period.endTime}
              </span>
            </p>
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
        <div className="p-6 space-y-4">
          {/* Subject selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Μάθημα
            </label>
            <div className="grid grid-cols-1 gap-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="" className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400">-- Επιλέξτε Μάθημα (ή Κενή Ώρα) --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                    {s.icon ? `${s.icon} ` : ''}
                    {s.name} {s.code ? `(${s.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <div
                style={{
                  backgroundColor: `${selectedSubject.color}18`,
                  borderColor: selectedSubject.color,
                }}
                className="mt-2.5 p-3 rounded-xl border flex items-center gap-2.5 text-xs"
              >
                <span className="text-xl">{selectedSubject.icon || '📚'}</span>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedSubject.name}</span>
                  {selectedSubject.defaultTeacher && (
                    <span className="text-slate-600 dark:text-slate-400 block text-[11px] mt-0.5">
                      Προκαθορισμένος: {selectedSubject.defaultTeacher}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Teacher override */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Καθηγητής / Δάσκαλος</span>
            </label>
            <input
              type="text"
              placeholder="π.χ. κος Παπαδόπουλος ή κα. Γεωργίου"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Room override */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Αίθουσα / Εργαστήριο</span>
            </label>
            <input
              type="text"
              placeholder="π.χ. Αίθουσα 14, Εργαστήριο Φυσικής, Γήπεδο"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Specific Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Σημείωση Ώρας</span>
            </label>
            <input
              type="text"
              placeholder="π.χ. Φέρτε γεωμετρικά όργανα / Διαγώνισμα"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div>
            {currentSlot?.subjectId && (
              <button
                type="button"
                onClick={handleClear}
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Καθαρισμός</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Ακύρωση
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Αποθήκευση</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
