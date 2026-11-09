import React from 'react';
import { GreekHoliday, ShiftEntry } from '../../types';
import {
  calculateShift,
  checkIsOvernight,
  findHoliday,
  formatDate,
  getFullEndTime,
  getISOWeekNumber,
  GREEK_DAYS_HEADER,
  isHolidayOrSunday,
  isSunday,
} from '../../utils/shiftCalculations';
import { Moon, Plus, Clock, AlertCircle } from 'lucide-react';

interface MonthCalendarProps {
  year: number;
  month: number; // 0-11
  entries: Record<string, ShiftEntry>;
  holidays: GreekHoliday[];
  onSelectDay: (dateStr: string) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  year,
  month,
  entries,
  holidays,
  onSelectDay,
}) => {
  const todayStr = formatDate(new Date());

  // Build grid weeks
  // First day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // Greek calendar: Monday is day 0, Sunday is day 6
  // JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  let startDayOfWeek = (firstDay.getDay() + 6) % 7;

  // Build grid matrix: array of weeks
  interface CalendarCell {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
  }

  const weeks: CalendarCell[][] = [];
  let currentWeek: CalendarCell[] = [];

  // Previous month padding days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, prevDayNum);
    currentWeek.push({
      dateStr: formatDate(prevDate),
      dayNum: prevDayNum,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    currentWeek.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month padding days to complete last week
  if (currentWeek.length > 0) {
    let nextDayNum = 1;
    while (currentWeek.length < 7) {
      const nextDate = new Date(year, month + 1, nextDayNum);
      currentWeek.push({
        dateStr: formatDate(nextDate),
        dayNum: nextDayNum,
        isCurrentMonth: false,
      });
      nextDayNum++;
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="w-full space-y-4">
      {/* Legend Header */}
      <div
        id="calendar-legend-bar"
        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 shadow-2xs transition-colors"
      >
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="h-3 w-3 rounded-xs bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
            <span>Βάρδια (Κανονική)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="flex h-4 items-center gap-0.5 rounded-xs bg-indigo-900/20 dark:bg-indigo-900/40 px-1 text-[10px] text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
              <Moon className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400" />
              Overnight
            </span>
            <span>Διανυκτέρευση (+25%)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-800 dark:text-emerald-300 font-semibold">DAY OFF (Ρεπό)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-sky-800 dark:text-sky-300 font-semibold">ΑΔΕΙΑ</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            <span className="text-purple-800 dark:text-purple-300 font-semibold">ΑΝΑΡΡΩΤΙΚΗ</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-800 dark:text-amber-300 font-semibold">ΑΡΓΙΑ (+75%)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="rounded-xs bg-amber-100 dark:bg-amber-950/80 px-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              +h
            </span>
            <span>Υπερωρία</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Κανόνας:</span> Σάββατο = Κανονική ημέρα, Κυριακή/Αργία = +75%
        </div>
      </div>

      {/* Main Calendar Grid (Excel Style with Straight Borders) */}
      <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors">
        <table className="w-full min-w-[760px] border-collapse text-left">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/90 text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-200">
              <th className="w-14 border-r border-slate-300 dark:border-slate-800 px-2 py-3 text-center text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800">
                ΕΒΔ
              </th>
              {GREEK_DAYS_HEADER.map((col) => {
                const isSun = col.isSunday;
                const isSat = col.isWeekend && !col.isSunday;
                return (
                  <th
                    key={col.key}
                    className={`border-r border-slate-300 dark:border-slate-800 px-2.5 py-3 text-center last:border-r-0 ${
                      isSun
                        ? 'bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-bold'
                        : isSat
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs uppercase">{col.label}</div>
                    <div className="text-[10px] font-normal text-slate-600 dark:text-slate-400">
                      {isSun ? '(Αργία +75%)' : isSat ? '(Κανονική)' : ''}
                    </div>
                  </th>
                );
              })}
              <th className="w-24 border-l border-slate-300 dark:border-slate-800 px-2 py-3 text-center text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 hidden lg:table-cell">
                ΣΥΝΟΛΟ
              </th>
            </tr>
          </thead>

          {/* Body Weeks */}
          <tbody>
            {weeks.map((week, wIndex) => {
              // Get ISO week number from the Thursday of the week
              const middleDay = week[3] ? week[3].dateStr : week[0].dateStr;
              const isoWeek = getISOWeekNumber(middleDay);

              // Calculate weekly totals
              let weekTotalHours = 0;
              let weekNightHours = 0;
              let weekExtraHours = 0;
              week.forEach((cell) => {
                const entry = entries[cell.dateStr];
                if (entry && entry.type === 'WORK') {
                  const calc = calculateShift(entry, holidays);
                  weekTotalHours += calc.totalWorkedHours;
                  weekNightHours += calc.nightNormalHours + calc.nightHolidayHours;
                  weekExtraHours += calc.extraNormalHours + calc.extraHolidayHours;
                }
              });

              return (
                <tr key={`week-${wIndex}`} className="border-b border-slate-300 dark:border-slate-800 last:border-b-0">
                  {/* Week Number Column (ΕΒΔ) */}
                  <td className="border-r border-slate-300 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 px-1 py-2 text-center align-top">
                    <div className="sticky top-0">
                      <span className="inline-block rounded-md bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        {isoWeek}
                      </span>
                      <div className="mt-1 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                        {weekTotalHours > 0 ? `${weekTotalHours}h` : '—'}
                      </div>
                    </div>
                  </td>

                  {/* 7 Days of the Week */}
                  {week.map((cell) => {
                    const entry = entries[cell.dateStr];
                    const holiday = findHoliday(cell.dateStr, holidays);
                    const isSun = isSunday(cell.dateStr);
                    const isToday = cell.dateStr === todayStr;
                    const isDayWork = entry?.type === 'WORK';
                    const isRepo = entry?.type === 'REPO';
                    const isAdeia = entry?.type === 'ADEIA';
                    const isArgia = entry?.type === 'ARGIA' || (!entry && Boolean(holiday));
                    const isSick = entry?.type === 'SICK';
                    const fullEndTime =
                      isDayWork && entry?.endTime
                        ? getFullEndTime(entry.endTime, entry.extraHours)
                        : entry?.endTime;
                    const isOvernight =
                      isDayWork &&
                      (entry?.isOvernight || checkIsOvernight(entry?.startTime || '', fullEndTime || ''));
                    const calc = isDayWork ? calculateShift(entry, holidays) : null;

                    // Top indicator border per day type
                    const topBorderClass = isRepo
                      ? 'border-t-2 border-t-emerald-500'
                      : isAdeia
                      ? 'border-t-2 border-t-sky-500'
                      : isArgia
                      ? 'border-t-2 border-t-amber-500'
                      : isSick
                      ? 'border-t-2 border-t-purple-500'
                      : isDayWork && isOvernight
                      ? 'border-t-2 border-t-indigo-500'
                      : isDayWork
                      ? 'border-t-2 border-t-slate-300 dark:border-t-slate-700'
                      : 'border-t-2 border-t-transparent';

                    // Background tint per day type
                    const cellBgClass = !cell.isCurrentMonth
                      ? 'bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-600'
                      : isRepo
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/20'
                      : isAdeia
                      ? 'bg-sky-50/35 dark:bg-sky-950/20'
                      : isArgia
                      ? 'bg-amber-50/35 dark:bg-amber-950/20'
                      : isSick
                      ? 'bg-purple-50/35 dark:bg-purple-950/20'
                      : isDayWork && isOvernight
                      ? 'bg-indigo-50/20 dark:bg-indigo-950/25'
                      : isDayWork
                      ? 'bg-white dark:bg-slate-900'
                      : isSun
                      ? 'bg-amber-50/15 dark:bg-amber-950/10'
                      : 'bg-white dark:bg-slate-900';

                    return (
                      <td
                        key={cell.dateStr}
                        onClick={() => onSelectDay(cell.dateStr)}
                        className={`group relative h-28 min-h-28 w-1/7 border-r border-slate-300 dark:border-slate-800 p-2 align-top transition-colors cursor-pointer last:border-r-0 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 ${topBorderClass} ${cellBgClass} ${
                          isToday ? 'ring-2 ring-slate-900 dark:ring-slate-100 ring-inset shadow-xs' : ''
                        }`}
                      >
                        {/* Day Cell Header: Number + Badges */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                              isToday
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                                : cell.isCurrentMonth
                                ? isSun
                                  ? 'text-amber-900 dark:text-amber-200 font-bold'
                                  : 'text-slate-800 dark:text-slate-200 font-semibold'
                                : 'text-slate-400 dark:text-slate-600'
                            }`}
                          >
                            {cell.dayNum}
                          </span>

                          <div className="flex items-center gap-1">
                            {isToday && (
                              <span className="hidden sm:inline-block rounded px-1.5 py-0.2 text-[9px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 tracking-wider">
                                ΣΗΜΕΡΑ
                              </span>
                            )}
                            {holiday && !isArgia && (
                              <span
                                title={holiday.name}
                                className="inline-flex max-w-[75px] truncate rounded bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 text-[9px] font-semibold text-amber-800 dark:text-amber-300"
                              >
                                {holiday.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cell Body: Shift Content - No inner borders */}
                        <div className="mt-1.5">
                          {/* 1. Normal Work Shift (Calm Baseline) */}
                          {isDayWork && entry.startTime && entry.endTime && (
                            <div className="space-y-1">
                              {/* Time Display */}
                              <div className="flex items-center justify-between font-mono text-sm sm:text-[15px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                <span>
                                  {entry.startTime}–{fullEndTime}
                                </span>
                                {isOvernight && (
                                  <span
                                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                                    title="Διανυκτέρευση (+25%)"
                                  >
                                    <Moon className="h-3.5 w-3.5 shrink-0" />
                                  </span>
                                )}
                              </div>

                              {/* Overtime or extra hours badge */}
                              {entry.extraHours && entry.extraHours > 0 ? (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 font-semibold text-amber-800 dark:text-amber-300">
                                    +{entry.extraHours}h υπερ.
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                                    {calc?.totalWorkedHours}h
                                  </span>
                                </div>
                              ) : null}

                              {/* Night hours note */}
                              {calc && (calc.nightNormalHours > 0 || calc.nightHolidayHours > 0) && (
                                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                  Νύχτα: {calc.nightNormalHours + calc.nightHolidayHours}h
                                </div>
                              )}

                              {/* Notes snippet */}
                              {entry.notes && (
                                <div className="truncate text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                  {entry.notes}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. DAY OFF (Highlighted) */}
                          {isRepo && (
                            <div className="mt-2 flex flex-col items-start">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                                DAY OFF
                              </span>
                              {entry.notes && entry.notes !== 'DAY OFF' && (
                                <span className="mt-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 truncate max-w-full">
                                  {entry.notes}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 3. ARGIA (Highlighted) */}
                          {isArgia && (
                            <div className="mt-2 flex flex-col items-start">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200 tracking-wide">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0" />
                                ΑΡΓΙΑ
                              </span>
                              {(entry?.customHolidayName || holiday?.name) && (
                                <span className="mt-1 text-[10px] font-medium text-amber-800 dark:text-amber-300 truncate max-w-full">
                                  {entry?.customHolidayName || holiday?.name}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 4. ADEIA (Highlighted) */}
                          {isAdeia && (
                            <div className="mt-2 flex flex-col items-start">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 dark:bg-sky-500/25 px-2.5 py-0.5 text-xs font-bold text-sky-800 dark:text-sky-300 tracking-wide">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400 shrink-0" />
                                ΑΔΕΙΑ
                              </span>
                              {entry.notes && (
                                <span className="mt-1 text-[10px] font-medium text-sky-700 dark:text-sky-400 truncate max-w-full">
                                  {entry.notes}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 5. SICK (Highlighted) */}
                          {isSick && (
                            <div className="mt-2 flex flex-col items-start">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 dark:bg-purple-500/25 px-2.5 py-0.5 text-xs font-bold text-purple-900 dark:text-purple-300 tracking-wide">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0" />
                                ΑΝΑΡΡΩΤΙΚΗ
                              </span>
                              {entry.notes && (
                                <span className="mt-1 text-[10px] font-medium text-purple-700 dark:text-purple-400 truncate max-w-full">
                                  {entry.notes}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Empty Day hover */}
                          {(!entry || entry.type === 'EMPTY') && !holiday && (
                            <div className="hidden h-6 items-center justify-center text-slate-300 dark:text-slate-600 group-hover:flex hover:text-slate-600 dark:hover:text-slate-300">
                              <Plus className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Week Total Column (Right) */}
                  <td className="border-l border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-2 text-center align-middle hidden lg:table-cell">
                    <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {weekTotalHours > 0 ? `${weekTotalHours}h` : '0h'}
                    </div>
                    {weekNightHours > 0 && (
                      <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">
                        🌙 {weekNightHours}h
                      </div>
                    )}
                    {weekExtraHours > 0 && (
                      <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold">
                        +{weekExtraHours}h
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
