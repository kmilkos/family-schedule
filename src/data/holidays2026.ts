import { GreekHoliday } from '../types';

export const DEFAULT_GREEK_HOLIDAYS_2026: GreekHoliday[] = [
  { date: '2026-01-01', name: 'Πρωτοχρονιά' },
  { date: '2026-01-06', name: 'Θεοφάνεια' },
  { date: '2026-02-23', name: 'Καθαρά Δευτέρα' },
  { date: '2026-03-25', name: 'Ευαγγελισμός / 25η Μαρτίου' },
  { date: '2026-04-10', name: 'Μεγάλη Παρασκευή' },
  { date: '2026-04-11', name: 'Μεγάλο Σάββατο (Τραπεζική)', isBankingHoliday: true },
  { date: '2026-04-12', name: 'Κυριακή του Πάσχα' },
  { date: '2026-04-13', name: 'Δευτέρα του Πάσχα' },
  { date: '2026-05-01', name: 'Εργατική Πρωτομαγιά' },
  { date: '2026-06-01', name: 'Αγίου Πνεύματος (Τραπεζική)', isBankingHoliday: true },
  { date: '2026-08-15', name: 'Κοίμηση της Θεοτόκου' },
  { date: '2026-10-28', name: '28η Οκτωβρίου' },
  { date: '2026-12-25', name: 'Χριστούγεννα' },
  { date: '2026-12-26', name: 'Σύναξη της Θεοτόκου' },
];

export const SHIFT_PRESET_TIMES = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export const DEFAULT_WAGE_PERIODS = [
  {
    id: 'p1',
    startDate: '2025-07-01',
    label: '1η Τριετία (10%)',
    baseSalary: 880,
    trienniumBonus: 88,
    hourlyWageMode: 'auto' as const,
    customHourlyWage: 5.81,
  },
  {
    id: 'p2',
    startDate: '2025-11-01',
    label: '2η Τριετία (20%)',
    baseSalary: 880,
    trienniumBonus: 176,
    hourlyWageMode: 'auto' as const,
    customHourlyWage: 6.34,
  },
  {
    id: 'p3',
    startDate: '2026-04-01',
    label: 'Αναπροσαρμογή 2026 + 2η Τριετία (20%)',
    baseSalary: 920,
    trienniumBonus: 184,
    hourlyWageMode: 'auto' as const,
    customHourlyWage: 6.62,
  },
];

export const DEFAULT_WAGE_SETTINGS = {
  baseSalary: 920,
  trienniumBonus: 184,
  hourlyWageMode: 'auto' as const,
  customHourlyWage: 6.62,
  workingDaysBase: 25,
  dailyHoursBase: 6.6667, // 166.67 hrs/month (standard Greek banking formula: Total Fixed Pay / (25 * 6.6667))
  contractHours: 8, // 8-hour full-time default
  nightPremiumPercent: 25,
  sundayHolidayPremiumPercent: 75,
  overtimeWeekdayPercent: 40,
  overtimeHolidayPercent: 75,
  wagePeriods: DEFAULT_WAGE_PERIODS,
};

