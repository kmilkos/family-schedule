import { DayCalculation, GreekHoliday, MonthSummary, ShiftEntry, WageSettings } from '../types';

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function getDayOfWeek(dateStr: string): number {
  // 0: Sunday, 1: Monday, ..., 6: Saturday
  const d = parseDate(dateStr);
  return d.getDay();
}

export function isSunday(dateStr: string): boolean {
  return getDayOfWeek(dateStr) === 0;
}

export function isSaturday(dateStr: string): boolean {
  return getDayOfWeek(dateStr) === 6;
}

export function findHoliday(dateStr: string, holidays: GreekHoliday[]): GreekHoliday | undefined {
  return holidays.find((h) => h.date === dateStr);
}

export function isHoliday(dateStr: string, holidays: GreekHoliday[]): boolean {
  return !!findHoliday(dateStr, holidays);
}

export function isHolidayOrSunday(dateStr: string, holidays: GreekHoliday[]): boolean {
  return isSunday(dateStr) || isHoliday(dateStr, holidays);
}

// Convert "HH:mm" to minutes from 00:00
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

// Format minutes to "HH:mm"
export function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Given start time and duration (default 8 hours), returns end time
export function getEndTimeForPreset(startTime: string, durationHours: number = 8): string {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationHours * 60;
  return minutesToTime(endMins);
}

// Given base end time and extra/overtime hours, returns the full shift end time (HH:mm)
export function getFullEndTime(endTime: string, extraHours?: number): string {
  const extra = Math.max(0, Number(extraHours) || 0);
  if (!endTime || extra === 0) return endTime;
  const endMins = timeToMinutes(endTime) + Math.round(extra * 60);
  return minutesToTime(endMins);
}

// Check if a shift is overnight (ends past midnight)
export function checkIsOvernight(startTime: string, endTime: string): boolean {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  return endMins <= startMins;
}

/**
 * Calculates exact breakdown of a shift into the standard labor law categories:
 * 1. Extra hours (normal day)
 * 2. Extra hours (holiday)
 * 3. Night hours (normal day) - 22:00 to 06:00
 * 4. Night hours (holiday) - 22:00 to 06:00
 */
export function calculateShift(
  entry: ShiftEntry,
  holidays: GreekHoliday[]
): DayCalculation {
  const dateStr = entry.date;
  const isSun = isSunday(dateStr);
  const isSat = isSaturday(dateStr);
  const holiday = findHoliday(dateStr, holidays);
  const isHol = !!holiday;
  const holidayName = holiday?.name || entry.customHolidayName;

  if (entry.type !== 'WORK' || !entry.startTime || !entry.endTime) {
    return {
      date: dateStr,
      dayType: entry.type,
      isSunday: isSun,
      isSaturday: isSat,
      isHoliday: isHol,
      holidayName,
      regularHours: 0,
      extraNormalHours: 0,
      extraHolidayHours: 0,
      nightNormalHours: 0,
      nightHolidayHours: 0,
      sundayHolidayWorkedHours: 0,
      totalWorkedHours: 0,
      isOvernight: false,
    };
  }

  const startMins = timeToMinutes(entry.startTime);
  let endMins = timeToMinutes(entry.endTime);
  const isOvernight = entry.isOvernight ?? checkIsOvernight(entry.startTime, entry.endTime);

  // Total shift duration in minutes
  let durationMins = endMins - startMins;
  if (isOvernight || durationMins <= 0) {
    durationMins = 1440 - startMins + endMins;
  }
  const regularHours = Math.round((durationMins / 60) * 100) / 100;

  // We analyze minute-by-minute or segment by segment across day 1 and day 2
  // Night window is 22:00 to 06:00 (1320 mins to 1440 mins, and 0 mins to 360 mins)
  let nightNormalMinutes = 0;
  let nightHolidayMinutes = 0;
  let sundayHolidayDayMinutes = 0;

  const nextDateStr = addDays(dateStr, 1);
  const isDay1Holiday = isHolidayOrSunday(dateStr, holidays);
  const isDay2Holiday = isHolidayOrSunday(nextDateStr, holidays);

  // Iterate in 15-minute resolution chunks for precision & speed
  const step = 15;
  for (let m = 0; m < durationMins; m += step) {
    const currentAbsoluteMin = startMins + m;
    const isDay2 = currentAbsoluteMin >= 1440;
    const minInDay = currentAbsoluteMin % 1440;
    const isHolidayDay = isDay2 ? isDay2Holiday : isDay1Holiday;

    // Is it inside 22:00 (1320) to 06:00 (360)?
    const isNight = minInDay >= 1320 || minInDay < 360;

    if (isNight) {
      if (isHolidayDay) {
        nightHolidayMinutes += step;
      } else {
        nightNormalMinutes += step;
      }
    } else {
      if (isHolidayDay) {
        sundayHolidayDayMinutes += step;
      }
    }
  }

  const nightNormalHours = Math.round((nightNormalMinutes / 60) * 100) / 100;
  const nightHolidayHours = Math.round((nightHolidayMinutes / 60) * 100) / 100;
  const sundayHolidayWorkedHours = Math.round(((sundayHolidayDayMinutes + nightHolidayMinutes) / 60) * 100) / 100;

  // Extra hours handling
  const extraHours = Math.max(0, Number(entry.extraHours) || 0);
  let extraNormalHours = 0;
  let extraHolidayHours = 0;

  // If the shift started on a holiday/Sunday, extra hours count as holiday overtime
  if (isDay1Holiday) {
    extraHolidayHours = extraHours;
  } else {
    extraNormalHours = extraHours;
  }

  const totalWorkedHours = Math.round((regularHours + extraHours) * 100) / 100;

  return {
    date: dateStr,
    dayType: 'WORK',
    isSunday: isSun,
    isSaturday: isSat,
    isHoliday: isHol,
    holidayName,
    regularHours,
    extraNormalHours,
    extraHolidayHours,
    nightNormalHours,
    nightHolidayHours,
    sundayHolidayWorkedHours,
    totalWorkedHours,
    isOvernight,
  };
}

// Calculate ISO Week Number (1-53) for the ΕΒΔ column
export function getISOWeekNumber(dateStr: string): number {
  const d = parseDate(dateStr);
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

// Get the effective WagePeriod for a specific date (YYYY-MM or YYYY-MM-DD)
export function getWagePeriodForDate(dateStr: string, settings: WageSettings) {
  if (!settings.wagePeriods || settings.wagePeriods.length === 0) {
    return null;
  }
  // Sort descending by startDate
  const sorted = [...settings.wagePeriods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  // Find the first period where startDate <= dateStr (or matching prefix)
  const target = dateStr.length === 7 ? `${dateStr}-01` : dateStr;
  const match = sorted.find((p) => {
    const pStart = p.startDate.length === 7 ? `${p.startDate}-01` : p.startDate;
    return pStart <= target;
  });
  // Fallback to earliest period if date is prior to all startDates
  return match || sorted[sorted.length - 1];
}

// Calculate hourly rate based on standard Greek labor law / collective agreements wage slip rules
export function calculateHourlyRate(settings: WageSettings, dateStr?: string): number {
  if (dateStr && settings.wagePeriods && settings.wagePeriods.length > 0) {
    const period = getWagePeriodForDate(dateStr, settings);
    if (period) {
      if (period.hourlyWageMode === 'custom') {
        return period.customHourlyWage;
      }
      const totalHoursBase = settings.workingDaysBase * settings.dailyHoursBase;
      if (totalHoursBase <= 0) return 0;
      const totalSalary = period.baseSalary + (period.trienniumBonus || 0);
      return Math.round((totalSalary / totalHoursBase) * 1000) / 1000;
    }
  }

  if (settings.hourlyWageMode === 'custom') {
    return settings.customHourlyWage;
  }
  // Standard Greek banking / labor formula: (Base + Triennium) / (25 * 6.6667) ≈ Total Fixed Pay / 166.67
  const totalHoursBase = settings.workingDaysBase * settings.dailyHoursBase;
  if (totalHoursBase <= 0) return 0;
  const totalSalary = settings.baseSalary + (settings.trienniumBonus || 0);
  return Math.round((totalSalary / totalHoursBase) * 1000) / 1000;
}

// Monthly summary calculation
export function calculateMonthSummary(
  year: number,
  month: number, // 0-11
  entries: Record<string, ShiftEntry>,
  holidays: GreekHoliday[],
  wageSettings: WageSettings
): MonthSummary {
  let totalWorkDays = 0;
  let totalRepoDays = 0;
  let totalAdeiaDays = 0;
  let totalSickDays = 0;
  let totalArgiaDays = 0;
  let totalWorkedHours = 0;
  let regularHours = 0;
  let extraNormalHours = 0;
  let extraHolidayHours = 0;
  let nightNormalHours = 0;
  let nightHolidayHours = 0;
  let sundayHolidayWorkedHours = 0;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = entries[dateStr] || { date: dateStr, type: 'EMPTY' };
    const hol = findHoliday(dateStr, holidays);

    if (entry.type === 'WORK') {
      totalWorkDays++;
      const calc = calculateShift(entry, holidays);
      regularHours += calc.regularHours;
      totalWorkedHours += calc.totalWorkedHours;
      extraNormalHours += calc.extraNormalHours;
      extraHolidayHours += calc.extraHolidayHours;
      nightNormalHours += calc.nightNormalHours;
      nightHolidayHours += calc.nightHolidayHours;
      sundayHolidayWorkedHours += calc.sundayHolidayWorkedHours;
    } else if (entry.type === 'REPO') {
      totalRepoDays++;
    } else if (entry.type === 'ADEIA') {
      totalAdeiaDays++;
    } else if (entry.type === 'SICK') {
      totalSickDays++;
    } else if (entry.type === 'ARGIA' || hol) {
      totalArgiaDays++;
    }
  }

  const monthDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const hourlyWage = calculateHourlyRate(wageSettings, monthDateStr);


  // Greek payroll wage slip formulas:
  // 1. Night differential (25% extra on hourly wage)
  const estimatedNightNormalPay = Math.round(nightNormalHours * hourlyWage * (wageSettings.nightPremiumPercent / 100) * 100) / 100;
  
  // 2. Sunday/Holiday worked hours (+75% extra on hourly wage)
  const estimatedHolidayWorkedPay = Math.round(sundayHolidayWorkedHours * hourlyWage * (wageSettings.sundayHolidayPremiumPercent / 100) * 100) / 100;

  // 3. Night hours on Sunday/Holiday (additional night 25% on top of the holiday pay)
  const estimatedNightHolidayPay = Math.round(nightHolidayHours * hourlyWage * (wageSettings.nightPremiumPercent / 100) * 100) / 100;

  // 4. Overtime normal days (40% extra or wageSettings)
  const estimatedExtraNormalPay = Math.round(extraNormalHours * hourlyWage * (1 + wageSettings.overtimeWeekdayPercent / 100) * 100) / 100;

  // 5. Overtime holiday (75% or extra)
  const estimatedExtraHolidayPay = Math.round(extraHolidayHours * hourlyWage * (1 + wageSettings.overtimeHolidayPercent / 100) * 100) / 100;

  const estimatedTotalPremiums = Math.round(
    (estimatedNightNormalPay + estimatedNightHolidayPay + estimatedHolidayWorkedPay + estimatedExtraNormalPay + estimatedExtraHolidayPay) * 100
  ) / 100;

  return {
    year,
    month,
    totalWorkDays,
    totalRepoDays,
    totalAdeiaDays,
    totalSickDays,
    totalArgiaDays,
    totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
    regularHours: Math.round(regularHours * 100) / 100,
    extraNormalHours: Math.round(extraNormalHours * 100) / 100,
    extraHolidayHours: Math.round(extraHolidayHours * 100) / 100,
    nightNormalHours: Math.round(nightNormalHours * 100) / 100,
    nightHolidayHours: Math.round(nightHolidayHours * 100) / 100,
    sundayHolidayWorkedHours: Math.round(sundayHolidayWorkedHours * 100) / 100,
    estimatedNightNormalPay,
    estimatedNightHolidayPay,
    estimatedHolidayWorkedPay,
    estimatedExtraNormalPay,
    estimatedExtraHolidayPay,
    estimatedTotalPremiums,
    hourlyWage: Math.round(hourlyWage * 100) / 100,
  };
}

export const GREEK_MONTHS = [
  'Ιανουάριος',
  'Φεβρουάριος',
  'Μάρτιος',
  'Απρίλιος',
  'Μάιος',
  'Ιούνιος',
  'Ιούλιος',
  'Αύγουστος',
  'Σεπτέμβριος',
  'Οκτώβριος',
  'Νοέμβριος',
  'Δεκέμβριος',
];

export const GREEK_DAYS_HEADER = [
  { key: 'mon', label: 'Δευτέρα', short: 'ΔΕΥ' },
  { key: 'tue', label: 'Τρίτη', short: 'ΤΡΙ' },
  { key: 'wed', label: 'Τετάρτη', short: 'ΤΕΤ' },
  { key: 'thu', label: 'Πέμπτη', short: 'ΠΕΜ' },
  { key: 'fri', label: 'Παρασκευή', short: 'ΠΑΡ' },
  { key: 'sat', label: 'Σάββατο', short: 'ΣΑΒ', isWeekend: true },
  { key: 'sun', label: 'Κυριακή', short: 'ΚΥΡ', isSunday: true },
];
