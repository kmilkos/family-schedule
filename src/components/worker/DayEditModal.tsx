import React, { useState, useEffect } from 'react';
import { DayType, GreekHoliday, ShiftEntry } from '../../types';
import {
  calculateShift,
  checkIsOvernight,
  findHoliday,
  getEndTimeForPreset,
  getFullEndTime,
  isHolidayOrSunday,
} from '../../utils/shiftCalculations';
import { SHIFT_PRESET_TIMES } from '../../data/holidays2026';
import { Moon, Clock, Calendar, AlertCircle, Trash2, Check, X, PlusCircle } from 'lucide-react';

interface DayEditModalProps {
  isOpen: boolean;
  dateStr: string;
  entry?: ShiftEntry;
  holidays: GreekHoliday[];
  contractHours?: number;
  onSave: (entry: ShiftEntry) => void;
  onDelete: (dateStr: string) => void;
  onClose: () => void;
}

export const DayEditModal: React.FC<DayEditModalProps> = ({
  isOpen,
  dateStr,
  entry,
  holidays,
  contractHours = 8,
  onSave,
  onDelete,
  onClose,
}) => {
  const [dayType, setDayType] = useState<DayType>('WORK');
  const [activeDuration, setActiveDuration] = useState<number>(contractHours);
  const defaultStart = contractHours === 4 ? '10:00' : '08:00';
  const [startTime, setStartTime] = useState<string>(defaultStart);
  const [endTime, setEndTime] = useState<string>(() => getEndTimeForPreset(defaultStart, contractHours));
  const [isOvernight, setIsOvernight] = useState<boolean>(false);
  const [extraHours, setExtraHours] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [customHolidayName, setCustomHolidayName] = useState<string>('');
  const [isRemote, setIsRemote] = useState<boolean>(false);
  const [isOnCall, setIsOnCall] = useState<boolean>(false);
  const [isSplitShift, setIsSplitShift] = useState<boolean>(false);
  const [secondStartTime, setSecondStartTime] = useState<string>('17:00');
  const [secondEndTime, setSecondEndTime] = useState<string>('21:00');

  useEffect(() => {
    if (entry && entry.type !== 'EMPTY') {
      setDayType(entry.type);
      const s = entry.startTime || defaultStart;
      const e = entry.endTime || getEndTimeForPreset(s, contractHours);
      setStartTime(s);
      setEndTime(e);
      setIsOvernight(entry.isOvernight ?? checkIsOvernight(s, e));
      setExtraHours(entry.extraHours ? String(entry.extraHours) : '0');
      setNotes(entry.notes || '');
      setCustomHolidayName(entry.customHolidayName || '');
      setIsRemote(Boolean(entry.isRemote));
      setIsOnCall(Boolean(entry.isOnCall));
      if (entry.secondSlot) {
        setIsSplitShift(true);
        setSecondStartTime(entry.secondSlot.startTime || '17:00');
        setSecondEndTime(entry.secondSlot.endTime || '21:00');
      } else {
        setIsSplitShift(false);
      }
      try {
        const [sh, sm] = s.split(':').map(Number);
        const [eh, em] = e.split(':').map(Number);
        let d = (eh * 60 + em) - (sh * 60 + sm);
        if (d <= 0 || entry.isOvernight) d += 1440;
        const hrs = Math.round((d / 60) * 10) / 10;
        const roundedHrs = Math.round(hrs);
        setActiveDuration([4, 6, 8].includes(roundedHrs) ? roundedHrs : contractHours);
      } catch {
        setActiveDuration(contractHours);
      }
    } else {
      setDayType('WORK');
      setActiveDuration(contractHours);
      const s = contractHours === 4 ? '10:00' : '08:00';
      const e = getEndTimeForPreset(s, contractHours);
      setStartTime(s);
      setEndTime(e);
      setIsOvernight(false);
      setExtraHours('0');
      setNotes('');
      setCustomHolidayName('');
      setIsRemote(false);
      setIsOnCall(false);
      setIsSplitShift(false);
    }
  }, [entry, dateStr, isOpen, contractHours]);

  if (!isOpen) return null;

  const holiday = findHoliday(dateStr, holidays);
  const isSundayOrHol = isHolidayOrSunday(dateStr, holidays);

  // Auto-detect overnight when times change
  const handleStartChange = (val: string) => {
    setStartTime(val);
    const end = getEndTimeForPreset(val, activeDuration);
    setEndTime(end);
    setIsOvernight(checkIsOvernight(val, end));
  };

  const handleCustomEndChange = (val: string) => {
    setEndTime(val);
    setIsOvernight(checkIsOvernight(startTime, val));
  };

  const handlePresetClick = (presetStart: string) => {
    setDayType('WORK');
    setStartTime(presetStart);
    const end = getEndTimeForPreset(presetStart, activeDuration);
    setEndTime(end);
    setIsOvernight(checkIsOvernight(presetStart, end));
  };

  const handleSetDuration = (hrs: number) => {
    setActiveDuration(hrs);
    const end = getEndTimeForPreset(startTime, hrs);
    setEndTime(end);
    setIsOvernight(checkIsOvernight(startTime, end));
  };

  // Preview calculation for this day
  const previewEntry: ShiftEntry = {
    date: dateStr,
    type: dayType,
    startTime: dayType === 'WORK' ? startTime : undefined,
    endTime: dayType === 'WORK' ? endTime : undefined,
    isOvernight,
    extraHours: parseFloat(extraHours) || 0,
    notes,
    customHolidayName,
    isRemote,
    isOnCall,
    secondSlot: isSplitShift ? {
      startTime: secondStartTime,
      endTime: secondEndTime,
      isOvernight: checkIsOvernight(secondStartTime, secondEndTime),
    } : undefined,
  };
  const calc = calculateShift(previewEntry, holidays);

  const handleSave = () => {
    onSave(previewEntry);
    onClose();
  };

  const formattedDateGreek = new Date(dateStr + 'T12:00:00').toLocaleDateString('el-GR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      id="day-edit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="day-edit-modal-dialog"
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Επεξεργασία Ημέρας</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{formattedDateGreek}</p>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[78vh] overflow-y-auto px-6 py-4 space-y-5">
          {/* Holiday Alert if detected */}
          {holiday && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
              <div>
                <span className="font-semibold">Επίσημη Αργία: </span>
                {holiday.name} {holiday.isBankingHoliday && '(Τραπεζική)'}
              </div>
            </div>
          )}

          {/* Quick Status Buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Τύπος Ημέρας / Κατάσταση
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                id="btn-daytype-work"
                type="button"
                onClick={() => setDayType('WORK')}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                  dayType === 'WORK'
                    ? 'bg-sky-600 text-white border-sky-500 font-bold shadow-md shadow-sky-600/25'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                ΒΑΡΔΙΑ
              </button>
              <button
                id="btn-daytype-repo"
                type="button"
                onClick={() => setDayType('REPO')}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                  dayType === 'REPO'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md shadow-emerald-600/25'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                ΡΕΠΟ
              </button>
              <button
                id="btn-daytype-adeia"
                type="button"
                onClick={() => setDayType('ADEIA')}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                  dayType === 'ADEIA'
                    ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md shadow-blue-600/25'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                ΑΔΕΙΑ
              </button>
              <button
                id="btn-daytype-sick"
                type="button"
                onClick={() => setDayType('SICK')}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                  dayType === 'SICK'
                    ? 'bg-purple-600 text-white border-purple-500 font-bold shadow-md shadow-purple-600/25'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                ΑΝΑΡΡΩΤΙΚΗ
              </button>
              <button
                id="btn-daytype-argia"
                type="button"
                onClick={() => setDayType('ARGIA')}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                  dayType === 'ARGIA'
                    ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-md shadow-amber-600/25'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                ΑΡΓΙΑ
              </button>
            </div>
          </div>

          {/* Special Day Information Banners */}
          {dayType === 'ADEIA' && (
            <div className="rounded-lg border border-sky-200 dark:border-sky-800/70 bg-sky-50/80 dark:bg-sky-950/40 p-3 text-sky-900 dark:text-sky-200 text-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-600 shrink-0" />
              <span>
                <strong>Κανονική Άδεια:</strong> Καταγράφεται ως ημέρα άδειας με πλήρεις αποδοχές και υπολογίζεται στα συγκεντρωτικά στατιστικά.
              </span>
            </div>
          )}

          {dayType === 'SICK' && (
            <div className="rounded-lg border border-purple-200 dark:border-purple-800/70 bg-purple-50/80 dark:bg-purple-950/40 p-3 text-purple-900 dark:text-purple-200 text-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0" />
              <span>
                <strong>Αναρρωτική Άδεια / Ασθένεια:</strong> Καταγράφεται ξεχωριστά από το Ρεπό και την Κανονική Άδεια με διακριτή επισήμανση.
              </span>
            </div>
          )}

          {dayType === 'REPO' && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/80 dark:bg-emerald-950/40 p-3 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
              <span>
                <strong>Ημέρα Ανάπαυσης (Ρεπό):</strong> Προγραμματισμένη ημέρα εκτός υπηρεσίας.
              </span>
            </div>
          )}

          {/* Work Shift Details */}
          {dayType === 'WORK' && (
            <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
              {/* Presets Grid & Duration Selector */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Έτοιμα Πρότυπα {activeDuration}ωρης Βάρδιας (Presets)
                    </span>
                    <span className="text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                      {activeDuration} ώρες
                    </span>
                  </div>

                  {/* Quick Duration Buttons (4h, 6h, 8h) */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 px-1 font-medium">Διάρκεια:</span>
                    {[4, 6, 8].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleSetDuration(h)}
                        className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          activeDuration === h
                            ? 'bg-sky-500 text-slate-950 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title={`Αλλαγή διάρκειας σε ${h} ώρες`}
                      >
                        {h}ωρο
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {SHIFT_PRESET_TIMES.map((preset) => {
                    const presetEnd = getEndTimeForPreset(preset, activeDuration);
                    const isSelected = startTime === preset && endTime === presetEnd;
                    const isNightPreset = preset >= '15:00' || preset <= '02:00';
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border transition text-center cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-500 font-bold shadow-sm shadow-sky-600/30'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {preset}
                        {isNightPreset && <span className="ml-1 text-[10px]">🌙</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hours Input */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ώρα Έναρξης
                  </label>
                  <input
                    id="input-start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ώρα Λήξης
                  </label>
                  <input
                    id="input-end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => handleCustomEndChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Work Form Toggles: Remote, On-Call, Split Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* Remote / WFH */}
                <button
                  type="button"
                  onClick={() => setIsRemote(!isRemote)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    isRemote
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🏠</span>
                    <span>Τηλεργασία (WFH)</span>
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] ${isRemote ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-400'}`}>
                    {isRemote && '✓'}
                  </span>
                </button>

                {/* On-Call / Standby */}
                <button
                  type="button"
                  onClick={() => setIsOnCall(!isOnCall)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    isOnCall
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📞</span>
                    <span>Εφημερία / On-Call</span>
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] ${isOnCall ? 'bg-purple-500 text-white border-purple-500' : 'border-slate-400'}`}>
                    {isOnCall && '✓'}
                  </span>
                </button>

                {/* Split Shift */}
                <button
                  type="button"
                  onClick={() => setIsSplitShift(!isSplitShift)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    isSplitShift
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>✂️</span>
                    <span>Σπαστό Ωράριο</span>
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] ${isSplitShift ? 'bg-sky-500 text-white border-sky-500' : 'border-slate-400'}`}>
                    {isSplitShift && '✓'}
                  </span>
                </button>
              </div>

              {/* Second Slot for Split Shift */}
              {isSplitShift && (
                <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900 dark:text-sky-300">
                      2ο Σκέλος Βάρδιας (Απογευματινό / Βραδινό)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Έναρξη 2ου Σκέλους
                      </label>
                      <input
                        type="time"
                        value={secondStartTime}
                        onChange={(e) => setSecondStartTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Λήξη 2ου Σκέλους
                      </label>
                      <input
                        type="time"
                        value={secondEndTime}
                        onChange={(e) => setSecondEndTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Hours / Overtime */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  + Επιπλέον Ώρες (Υπερωρία / Πρόσθετες)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-extra-hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="12"
                    value={extraHours}
                    onChange={(e) => setExtraHours(e.target.value)}
                    placeholder="π.χ. 1.5"
                    className="w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="flex gap-1">
                    {['+1.0', '+1.5', '+2.0'].map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => setExtraHours(btn.replace('+', ''))}
                        className="rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        {btn}h
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Υπολογίζεται αυτόματα σε Καθημερινής ή Κυριακής/Αργίας βάσει ημέρας.
                </p>
                {(parseFloat(extraHours) || 0) > 0 && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs font-mono font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg">
                    <span>Πλήρες ωράριο: {startTime}–{getFullEndTime(endTime, parseFloat(extraHours))}</span>
                    <span className="rounded bg-amber-200/80 dark:bg-amber-900/80 px-1.5 py-0.2 text-[10px]">
                      +{parseFloat(extraHours)}h υπερ.
                    </span>
                  </div>
                )}
              </div>

              {/* Real-Time Calculation Preview */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ανάλυση Ωρών Βάρδιας (Κανόνες Υπολογισμού)
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Σύνολο: {calc.totalWorkedHours}h
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-400">Κανονικές Ώρες:</span>
                    <span className="font-mono font-semibold">{calc.regularHours}h</span>
                  </div>
                  <div className="flex justify-between bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1.5 rounded-lg text-indigo-900 dark:text-indigo-300">
                    <span className="flex items-center gap-1">
                      <Moon className="h-3 w-3 text-indigo-600 dark:text-indigo-400" /> Νυχτερινά Καθημ.:
                    </span>
                    <span className="font-mono font-semibold">{calc.nightNormalHours}h</span>
                  </div>
                  <div className="flex justify-between bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/20 px-2.5 py-1.5 rounded-lg text-purple-900 dark:text-purple-300">
                    <span className="flex items-center gap-1">
                      <Moon className="h-3 w-3 text-purple-600 dark:text-purple-400" /> Νυχτερινά Αργίας/Κυρ.:
                    </span>
                    <span className="font-mono font-semibold">{calc.nightHolidayHours}h</span>
                  </div>
                  <div className="flex justify-between bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1.5 rounded-lg text-amber-900 dark:text-amber-300">
                    <span>Υπερωρία Καθημ.:</span>
                    <span className="font-mono font-semibold">{calc.extraNormalHours}h</span>
                  </div>
                  <div className="flex justify-between bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1.5 rounded-lg text-rose-900 dark:text-rose-300">
                    <span>Υπερωρία Αργίας/Κυρ.:</span>
                    <span className="font-mono font-semibold">{calc.extraHolidayHours}h</span>
                  </div>
                  {calc.sundayHolidayWorkedHours > 0 && (
                    <div className="flex justify-between bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-emerald-900 dark:text-emerald-300 col-span-2">
                      <span>Ώρες σε Κυριακή/Αργία (+75%):</span>
                      <span className="font-mono font-semibold">{calc.sundayHolidayWorkedHours}h</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* If Custom Holiday */}
          {dayType === 'ARGIA' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Όνομα Αργίας (Προαιρετικό)
              </label>
              <input
                id="input-custom-holiday"
                type="text"
                value={customHolidayName}
                onChange={(e) => setCustomHolidayName(e.target.value)}
                placeholder={holiday?.name || 'π.χ. Τοπική Τραπεζική Αργία'}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}

          {/* Notes field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Σημειώσεις / Παρατηρήσεις
            </label>
            <input
              id="input-shift-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="π.χ. Βάρδια Υποστήριξης, Αλλαγή με συνάδελφο"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 px-6 py-4">
          {entry && entry.type !== 'EMPTY' ? (
            <button
              id="btn-delete-shift"
              type="button"
              onClick={() => {
                onDelete(dateStr);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Καθαρισμός Ημέρας
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-modal"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Ακύρωση
            </button>
            <button
              id="btn-save-shift"
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 active:scale-95 transition cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Αποθήκευση
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
