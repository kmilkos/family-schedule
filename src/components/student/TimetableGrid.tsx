'use client';

import React, { useState } from 'react';
import { Profile, DayOfWeek, ScheduleSlot, Period } from '../../types';
import { DAYS } from '../../data/studentPresets';
import {
  Clock,
  MapPin,
  User,
  Edit2,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  CalendarDays,
} from 'lucide-react';

interface TimetableGridProps {
  profile: Profile;
  selectedSubjectId: string | null;
  onSlotClick: (day: DayOfWeek, period: Period) => void;
  onEditSlotModal: (day: DayOfWeek, period: Period) => void;
  onClearSlot: (day: DayOfWeek, periodId: number) => void;
  onToggleSaturday: () => void;
  onToggleAllDay?: () => void;
  onOpenActivityManager?: () => void;
  onOpenPeriodManager?: (periodId?: number) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  profile,
  selectedSubjectId,
  onSlotClick,
  onEditSlotModal,
  onClearSlot,
  onToggleSaturday,
  onToggleAllDay,
  onOpenActivityManager,
  onOpenPeriodManager,
}) => {
  const isPrimary = profile.schoolLevel === 'primary';
  const hasAllDayDeparture = Boolean(profile.departureTime && profile.departureTime > '13:15');
  const showAllDay =
    profile.showAllDay ??
    (isPrimary && hasAllDayDeparture);
  const shouldShowAllDayOnPrint = isPrimary && (showAllDay || hasAllDayDeparture);

  const visiblePeriods = profile.periods.filter((period) => {
    if (period.isAllDay || period.id >= 7) {
      return showAllDay;
    }
    return true;
  });

  // Determine current day for highlighting
  const currentDayIndex = new Date().getDay(); // 0: Sun, 1: Mon, ... 6: Sat
  const dayIndexMap: Record<number, DayOfWeek> = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  const todayId = dayIndexMap[currentDayIndex] || 'monday';

  // Mobile selected day tab
  const [mobileDay, setMobileDay] = useState<DayOfWeek>(todayId);

  // Mobile view mode: 'day' (cards) or 'week' (full scrollable table)
  const [mobileViewMode, setMobileViewMode] = useState<'day' | 'week'>('day');

  const visibleDays = DAYS.filter((d) => d.id !== 'saturday' || profile.showSaturday);

  const currentDayIndexInVisible = visibleDays.findIndex((d) => d.id === mobileDay);

  const handlePrevDay = () => {
    if (currentDayIndexInVisible > 0) {
      setMobileDay(visibleDays[currentDayIndexInVisible - 1].id);
    } else {
      setMobileDay(visibleDays[visibleDays.length - 1].id);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndexInVisible < visibleDays.length - 1) {
      setMobileDay(visibleDays[currentDayIndexInVisible + 1].id);
    } else {
      setMobileDay(visibleDays[0].id);
    }
  };

  const getSlot = (day: DayOfWeek, periodId: number) => {
    return profile.schedule.find((s) => s.day === day && s.periodId === periodId);
  };

  const getSubject = (subjectId?: string) => {
    if (!subjectId) return null;
    return profile.subjects.find((s) => s.id === subjectId);
  };

  const getSubjectTaskCount = (subjectId?: string) => {
    if (!subjectId) return 0;
    return profile.tasks.filter((t) => t.subjectId === subjectId && !t.completed).length;
  };

  const getActivitiesForDay = (dayId: DayOfWeek) => {
    return (profile.afternoonActivities || []).filter((a) => a.days?.includes(dayId));
  };

  return (
    <div className="space-y-3">
      {/* Mobile Top Navigation & Mode Switcher */}
      <div className="md:hidden space-y-2 no-print">
        {/* Controls row: Day vs Week mode toggle + Prev/Next buttons */}
        <div className="flex items-center justify-between gap-2">
          {/* Day / Week View Mode Switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setMobileViewMode('day')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                mobileViewMode === 'day'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Ημέρα</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('week')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                mobileViewMode === 'week'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Εβδομάδα</span>
            </button>
          </div>

          {/* Prev / Next Day navigation buttons (when in day view) */}
          {mobileViewMode === 'day' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-colors"
                title="Προηγούμενη ημέρα"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-1">
                {visibleDays.find((d) => d.id === mobileDay)?.name}
              </span>
              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-colors"
                title="Επόμενη ημέρα"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Day Selector Pills Carousel (when in day mode) */}
        {mobileViewMode === 'day' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {visibleDays.map((day) => {
              const isToday = day.id === todayId;
              const isSelected = day.id === mobileDay;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setMobileDay(day.id)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{day.shortName}</span>
                  {isToday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop & Tablet Table Matrix (AND Mobile when in Week mode) */}
      <div
        className={`bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs dark:shadow-xl overflow-hidden ${
          mobileViewMode === 'day' ? 'hidden md:block' : 'block'
        } print:block print:border-none print:shadow-none`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[580px] md:min-w-full">
            {/* Header: Days */}
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-2 sm:px-3 text-left w-24 sm:w-28 lg:w-32 font-bold text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-100 dark:bg-slate-950 z-10">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Ώρα</span>
                    </div>
                    {onOpenPeriodManager && (
                      <button
                        type="button"
                        onClick={() => onOpenPeriodManager()}
                        className="p-1 rounded-md text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors no-print cursor-pointer"
                        title="Επεξεργασία ωραρίου και διδακτικών ωρών"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
                {visibleDays.map((day) => {
                  const isToday = day.id === todayId;
                  return (
                    <th
                      key={day.id}
                      className={`py-2.5 px-2 text-center font-bold text-xs sm:text-sm border-r border-slate-200 dark:border-slate-800 last:border-r-0 print:py-1 print:px-1 ${
                        isToday ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 print:bg-white print:text-slate-900' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{day.name}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 text-[9px] font-bold hidden sm:inline-block shadow-xs print:hidden">
                            Σήμερα
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Timetable Rows */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {visiblePeriods.map((period) => (
                <React.Fragment key={period.id}>
                  {/* All-Day Section Banner before period 7 (Screen Only) */}
                  {(period.id === 7 || (period.isAllDay && !visiblePeriods.some((p) => p.isAllDay && p.id < period.id))) && (
                    <tr key="all-day-divider" className="bg-amber-500/10 border-y-2 border-amber-500/30 print:hidden">
                      <td colSpan={visibleDays.length + 1} className="py-2.5 px-3">
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                            <span className="text-base">☀️</span>
                            <span className="uppercase tracking-wider">Ολοήμερο Πρόγραμμα Δημοτικού</span>
                            <span className="text-[10px] font-normal text-amber-700/80 dark:text-amber-400/80">
                              (13:15 – 16:00 / 17:30)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-800 dark:text-amber-200">
                            <span className="bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                              1η Αποχώρηση: 14:55
                            </span>
                            <span className="bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                              2η Αποχώρηση: 16:00
                            </span>
                            <span className="bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                              Διευρυμένο: 17:30
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${(period.isAllDay || period.id >= 7) ? 'print:hidden' : ''}`}>
                    {/* Period Time Column */}
                    <td className="py-2 px-2.5 bg-slate-50/90 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800 align-middle sticky left-0 z-10 print:py-0.5 print:px-1 group/period">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 print:text-[11px]">{period.label}</div>
                        {onOpenPeriodManager && (
                          <button
                            type="button"
                            onClick={() => onOpenPeriodManager(period.id)}
                            className="opacity-0 group-hover/period:opacity-100 p-0.5 rounded text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-opacity no-print cursor-pointer"
                            title={`Επεξεργασία ${period.label}`}
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5 print:mt-0 print:text-[9px]">
                        <span>{period.startTime}</span>
                        <span className="text-slate-400 dark:text-slate-600">-</span>
                        <span>{period.endTime}</span>
                      </div>
                      {(period.isAllDay || period.id >= 7) && (
                        <div className="text-[9px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                          ☀️ Ολοήμερο
                        </div>
                      )}
                      {(period.breakAfterMinutes ?? 0) > 0 ? (
                        <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          ☕ {period.breakAfterMinutes}&apos;
                        </div>
                      ) : null}
                    </td>

                  {/* Day Slots */}
                  {visibleDays.map((day) => {
                    const slot = getSlot(day.id, period.id);
                    const subject = slot ? getSubject(slot.subjectId) : null;
                    const teacher = slot?.teacher || subject?.defaultTeacher;
                    const room = slot?.room || subject?.defaultRoom;
                    const taskCount = getSubjectTaskCount(slot?.subjectId);
                    const isToday = day.id === todayId;

                    return (
                      <td
                        key={day.id}
                        onClick={() => onSlotClick(day.id, period)}
                        style={
                          subject
                            ? {
                                backgroundColor: `${subject.color}15`,
                                borderLeft: `3px solid ${subject.color}`,
                              }
                            : undefined
                        }
                        className={`px-2.5 py-1.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-middle transition-all cursor-pointer relative group print:px-1 print:py-0.5 ${
                          isToday && !subject ? 'bg-emerald-50/40 dark:bg-emerald-950/15' : ''
                        } ${
                          selectedSubjectId
                            ? 'hover:ring-2 hover:ring-emerald-400 hover:ring-inset'
                            : subject
                            ? 'hover:brightness-105 dark:hover:brightness-110'
                            : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        {subject ? (
                          <div className="flex flex-col justify-center min-h-[46px] print:min-h-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs sm:text-sm shrink-0">{subject.icon}</span>
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                                  {subject.name}
                                </span>
                              </div>

                              {/* Quick Action Buttons on Hover */}
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0 no-print">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditSlotModal(day.id, period);
                                  }}
                                  className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Επεξεργασία ώρας"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClearSlot(day.id, period.id);
                                  }}
                                  className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Καθαρισμός"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Teacher, Room, Note & Tasks in a compact second row */}
                            {(teacher || room || slot?.note || taskCount > 0) && (
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-600 dark:text-slate-300 flex-wrap leading-tight">
                                {teacher && (
                                  <span className="flex items-center gap-0.5 truncate text-slate-500 dark:text-slate-400">
                                    <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                    <span>{teacher}</span>
                                  </span>
                                )}
                                {room && (
                                  <span className="flex items-center gap-0.5 font-medium text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                    <span>{room}</span>
                                  </span>
                                )}
                                {slot?.note && (
                                  <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-medium truncate">
                                    📌 {slot.note}
                                  </span>
                                )}
                                {taskCount > 0 && (
                                  <span className="flex items-center gap-0.5 text-[9px] text-amber-700 dark:text-amber-300 font-semibold">
                                    <BookOpen className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                    <span>{taskCount} εργ.</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Empty Slot */
                          <div className="min-h-[46px] flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors text-xs">
                            <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                  </tr>
                </React.Fragment>
              ))}

              {/* Epigrammatic All-Day Summary Row for Print (Clean, single compact line) */}
              {shouldShowAllDayOnPrint && (
                <tr key="all-day-print-summary" className="print-only border-y border-amber-300 bg-amber-50/60 leading-tight">
                  <td colSpan={visibleDays.length + 1} className="py-1 px-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-800">
                      <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                        <span className="font-bold text-amber-900 flex items-center gap-1 shrink-0">
                          <span>☀️</span>
                          <span>Ολοήμερο:</span>
                        </span>
                        <span className="font-medium text-slate-700">
                          <strong>13:20–14:00</strong> Σίτιση
                        </span>
                        <span className="text-amber-400 font-bold">•</span>
                        <span className="font-medium text-slate-700">
                          <strong>14:15–15:00</strong> Μελέτη
                        </span>
                        <span className="text-amber-400 font-bold">•</span>
                        <span className="font-medium text-slate-700">
                          <strong>15:15–16:00</strong> Δράσεις
                        </span>
                        <span className="text-amber-400 font-bold">•</span>
                        <span className="font-medium text-slate-700">
                          <strong>16:15–17:30</strong> Όμιλοι
                        </span>
                      </div>
                      <div className="shrink-0 font-mono text-[10px]">
                        <span className="text-slate-600">Σχόλασμα: </span>
                        <strong className="text-amber-900 font-bold">{profile.departureTime || '14:55'}</strong>
                        {profile.departureNote ? ` (${profile.departureNote})` : ''}
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Afternoon Extracurricular Activities Row */}
              <tr className="bg-amber-50/40 dark:bg-amber-950/20 border-t-2 border-amber-500/30 print:border-t print:border-amber-300">
                <td className="py-2.5 px-2 bg-slate-50/95 dark:bg-slate-950/95 border-r border-slate-200 dark:border-slate-800 align-top sticky left-0 z-10 print:py-1 print:px-1.5">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs print:text-[11px]">
                    <span>🌅</span>
                    <span>Απογευματινά</span>
                  </div>
                  <div className="text-[10px] text-amber-600/80 dark:text-amber-500/80 font-medium mt-0.5 print:hidden">
                    Εξωσχολικά
                  </div>
                  {onOpenActivityManager && (
                    <button
                      type="button"
                      onClick={onOpenActivityManager}
                      className="mt-2 text-[10px] font-bold text-amber-800 dark:text-amber-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/90 border border-amber-300 dark:border-amber-500/30 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer no-print"
                      title="Διαχείριση απογευματινών δραστηριοτήτων"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ρύθμιση</span>
                    </button>
                  )}
                </td>
                {visibleDays.map((day) => {
                  const dayActivities = getActivitiesForDay(day.id);
                  return (
                    <td
                      key={day.id}
                      className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top bg-slate-50/30 dark:bg-slate-950/20 print:py-0.5 print:px-1"
                    >
                      {dayActivities.length > 0 ? (
                        <div className="space-y-1.5 print:space-y-1">
                          {dayActivities.map((act) => (
                            <div
                              key={act.id}
                              onClick={onOpenActivityManager}
                              className="p-2 rounded-xl border text-xs shadow-xs hover:shadow-md transition-all cursor-pointer group print:p-1 print:rounded-lg print:shadow-none"
                              style={{
                                backgroundColor: `${act.color || '#f59e0b'}20`,
                                borderColor: `${act.color || '#f59e0b'}50`,
                              }}
                              title={act.notes ? `${act.name}: ${act.notes}` : act.name}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate flex items-center gap-1">
                                  <span>{act.icon}</span>
                                  <span>{act.name}</span>
                                </span>
                              </div>
                              <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 font-mono mt-0.5">
                                {act.startTime} - {act.endTime}
                              </div>
                              {act.location && (
                                <div className="text-[9px] text-slate-600 dark:text-slate-400 truncate flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{act.location}</span>
                                </div>
                              )}
                              {act.instructor && (
                                <div className="text-[9px] text-slate-600 dark:text-slate-400 truncate flex items-center gap-0.5">
                                  <User className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{act.instructor}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onClick={onOpenActivityManager}
                          className="h-full min-h-[44px] rounded-xl border border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400/40 hover:bg-amber-500/5 transition-all text-xs cursor-pointer"
                          title="Προσθήκη δραστηριότητας"
                        >
                          <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">-</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card-Based Schedule for the Selected Day */}
      {mobileViewMode === 'day' && (
        <div className="md:hidden space-y-2 no-print">
          {visiblePeriods.map((period, index) => {
            const slot = getSlot(mobileDay, period.id);
            const subject = slot ? getSubject(slot.subjectId) : null;
            const teacher = slot?.teacher || subject?.defaultTeacher;
            const room = slot?.room || subject?.defaultRoom;
            const taskCount = getSubjectTaskCount(slot?.subjectId);

            return (
              <React.Fragment key={period.id}>
                {/* Mobile All-Day divider before period 7 */}
                {(period.id === 7 || (period.isAllDay && !visiblePeriods.some((p) => p.isAllDay && p.id < period.id))) && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2 my-2">
                    <div className="flex items-center gap-1.5">
                      <span>☀️</span>
                      <span>Ολοήμερο Πρόγραμμα Δημοτικού</span>
                    </div>
                    <span className="text-[10px] font-normal text-amber-700 dark:text-amber-300 font-mono">13:15 – 16:00 / 17:30</span>
                  </div>
                )}
                <div
                  onClick={() => onSlotClick(mobileDay, period)}
                  style={
                    subject
                      ? {
                          borderLeft: `4px solid ${subject.color}`,
                          backgroundColor: `${subject.color}14`,
                        }
                      : undefined
                  }
                  className={`border rounded-xl p-2.5 shadow-xs dark:shadow-md flex items-center justify-between gap-2.5 transition-all cursor-pointer active:scale-[0.99] ${
                    subject
                      ? 'border-slate-200 dark:border-slate-800 hover:brightness-105'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Period Time Column */}
                  <div
                    onClick={(e) => {
                      if (onOpenPeriodManager) {
                        e.stopPropagation();
                        onOpenPeriodManager(period.id);
                      }
                    }}
                    className={`w-16 shrink-0 text-left border-r border-slate-200 dark:border-slate-800 pr-2 ${
                      onOpenPeriodManager ? 'cursor-pointer hover:opacity-80 active:opacity-60' : ''
                    }`}
                    title={onOpenPeriodManager ? 'Επεξεργασία ώρας' : undefined}
                  >
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>{period.label}</span>
                      {onOpenPeriodManager && (
                        <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-60" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {period.startTime}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {period.endTime}
                    </div>
                    {(period.isAllDay || period.id >= 7) && (
                      <div className="text-[8px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                        ☀️ Ολοήμερο
                      </div>
                    )}
                  </div>

                  {/* Slot Content */}
                  <div className="flex-1 min-w-0">
                    {subject ? (
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          <span className="text-sm">{subject.icon}</span>
                          <span className="truncate">{subject.name}</span>
                          {subject.code && (
                            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                              ({subject.code})
                            </span>
                          )}
                        </div>

                        {(teacher || room || slot?.note) && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 flex-wrap">
                            {teacher && (
                              <span className="flex items-center gap-0.5 truncate text-slate-500 dark:text-slate-400">
                                <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{teacher}</span>
                              </span>
                            )}
                            {room && (
                              <span className="flex items-center gap-0.5 font-medium text-slate-600 dark:text-slate-300">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{room}</span>
                              </span>
                            )}
                            {slot?.note && (
                              <span className="text-emerald-700 dark:text-emerald-300 font-medium truncate">
                                📌 {slot.note}
                              </span>
                            )}
                          </div>
                        )}

                        {taskCount > 0 && (
                          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{taskCount} εκκρεμής εργασία</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-2 text-slate-400 dark:text-slate-600 text-xs flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Κενή ώρα</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSlotModal(mobileDay, period);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Επεξεργασία"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {slot?.subjectId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearSlot(mobileDay, period.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Καθαρισμός"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtle break indicator between mobile cards */}
                {(period.breakAfterMinutes ?? 0) > 0 && index < profile.periods.length - 1 && (
                  <div className="flex items-center justify-center my-0.5">
                    <span className="text-[10px] text-amber-800 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      ☕ Διάλειμμα {period.breakAfterMinutes} λεπτών
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Mobile Afternoon Activities Section for Selected Day */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-3">
            <div className="flex items-center justify-between pb-1.5 px-0.5">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>🌅</span>
                <span>Απογευματινές Δραστηριότητες</span>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  {getActivitiesForDay(mobileDay).length}
                </span>
              </div>
              {onOpenActivityManager && (
                <button
                  type="button"
                  onClick={onOpenActivityManager}
                  className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ρύθμιση</span>
                </button>
              )}
            </div>

            {getActivitiesForDay(mobileDay).length > 0 ? (
              <div className="space-y-1.5">
                {getActivitiesForDay(mobileDay).map((act) => (
                  <div
                    key={act.id}
                    onClick={onOpenActivityManager}
                    className="bg-white dark:bg-slate-900/90 border rounded-2xl p-2.5 shadow-xs dark:shadow-md flex items-center justify-between gap-2.5 transition-all cursor-pointer active:scale-[0.99]"
                    style={{
                      borderColor: `${act.color || '#f59e0b'}50`,
                      backgroundColor: `${act.color || '#f59e0b'}20`,
                    }}
                  >
                    <div className="w-16 shrink-0 text-left border-r border-slate-200 dark:border-slate-800 pr-2">
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono">
                        {act.startTime}
                      </div>
                      <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                        {act.endTime}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs">
                        <span className="text-sm">{act.icon}</span>
                        <span className="truncate">{act.name}</span>
                      </div>
                      {(act.location || act.instructor) && (
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                          {act.location && <span>📍 {act.location}</span>}
                          {act.instructor && <span>👤 {act.instructor}</span>}
                        </div>
                      )}
                      {act.notes && (
                        <div className="text-[9px] text-amber-800/80 dark:text-amber-300/80 italic mt-0.5 truncate">
                          💡 {act.notes}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenActivityManager) onOpenActivityManager();
                      }}
                      className="p-1.5 rounded-lg text-amber-700 dark:text-amber-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={onOpenActivityManager}
                className="p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-center text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:border-amber-400/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Δεν υπάρχουν δραστηριότητες για {visibleDays.find((d) => d.id === mobileDay)?.name}. Προσθήκη;</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom options: All-Day and Saturday toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 no-print">
        {isPrimary && onToggleAllDay && (
          <button
            type="button"
            onClick={onToggleAllDay}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              showAllDay
                ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>☀️</span>
            <span>{showAllDay ? 'Απόκρυψη Ολοημέρου' : 'Εμφάνιση Ολοημέρου'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={onToggleSaturday}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors ml-auto cursor-pointer"
        >
          <span>{profile.showSaturday ? '➖ Απόκρυψη Σαββάτου' : '➕ Εμφάνιση Σαββάτου (για φροντιστήρια/δραστηριότητες)'}</span>
        </button>
      </div>
    </div>
  );
};
