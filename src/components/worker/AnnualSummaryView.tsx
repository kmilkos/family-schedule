import React from 'react';
import { GreekHoliday, MonthSummary, ShiftEntry, WageSettings } from '../../types';
import {
  calculateHourlyRate,
  calculateMonthSummary,
  calculateShift,
  findHoliday,
  getFullEndTime,
  getWagePeriodForDate,
  GREEK_MONTHS,
  isHolidayOrSunday,
  isSunday,
  parseDate,
} from '../../utils/shiftCalculations';
import { Award, Calendar, Moon, TrendingUp, DollarSign, Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react';

interface AnnualSummaryViewProps {
  year: number;
  entries: Record<string, ShiftEntry>;
  holidays: GreekHoliday[];
  wageSettings: WageSettings;
  onSelectMonth: (month: number) => void;
  onSelectDay: (dateStr: string) => void;
  onSelectYear?: (year: number) => void;
}

export const AnnualSummaryView: React.FC<AnnualSummaryViewProps> = ({
  year,
  entries,
  holidays,
  wageSettings,
  onSelectMonth,
  onSelectDay,
  onSelectYear,
}) => {
  // Calculate summary for all 12 months
  const monthlySummaries: MonthSummary[] = [];
  let annualWorkDays = 0;
  let annualRepoDays = 0;
  let annualAdeiaDays = 0;
  let annualSickDays = 0;
  let annualWorkedHours = 0;
  let annualExtraNormalHours = 0;
  let annualExtraHolidayHours = 0;
  let annualNightNormalHours = 0;
  let annualNightHolidayHours = 0;
  let annualSundayHolidayWorkedHours = 0;
  let annualTotalPremiums = 0;

  for (let m = 0; m < 12; m++) {
    const s = calculateMonthSummary(year, m, entries, holidays, wageSettings);
    monthlySummaries.push(s);

    annualWorkDays += s.totalWorkDays;
    annualRepoDays += s.totalRepoDays;
    annualAdeiaDays += s.totalAdeiaDays;
    annualSickDays += s.totalSickDays;
    annualWorkedHours += s.totalWorkedHours;
    annualExtraNormalHours += s.extraNormalHours;
    annualExtraHolidayHours += s.extraHolidayHours;
    annualNightNormalHours += s.nightNormalHours;
    annualNightHolidayHours += s.nightHolidayHours;
    annualSundayHolidayWorkedHours += s.sundayHolidayWorkedHours;
    annualTotalPremiums += s.estimatedTotalPremiums;
  }

  // Find WORKED holidays only (across the entire year)
  interface WorkedHolidayItem {
    dateStr: string;
    holidayName: string;
    isSundayOnly: boolean;
    entry: ShiftEntry;
    calc: ReturnType<typeof calculateShift>;
    premiumPay: number;
  }

  const workedHolidaysList: WorkedHolidayItem[] = [];

  const sortedDates = Object.keys(entries).sort();
  for (const dateStr of sortedDates) {
    const [y] = dateStr.split('-').map(Number);
    if (y !== year) continue;

    const entry = entries[dateStr];
    if (!entry || entry.type !== 'WORK' || !entry.startTime || !entry.endTime) continue;

    const hol = findHoliday(dateStr, holidays);
    const isSun = isSunday(dateStr);

    if (hol || isSun) {
      const calc = calculateShift(entry, holidays);
      const hourly = calculateHourlyRate(wageSettings, dateStr);

      const premiumPay = Math.round(
        (calc.sundayHolidayWorkedHours * hourly * (wageSettings.sundayHolidayPremiumPercent / 100) +
         calc.nightHolidayHours * hourly * (wageSettings.nightPremiumPercent / 100) +
         calc.extraHolidayHours * hourly * (1 + wageSettings.overtimeHolidayPercent / 100)) * 100
      ) / 100;

      workedHolidaysList.push({
        dateStr,
        holidayName: hol ? hol.name : 'Κυριακή',
        isSundayOnly: !hol && isSun,
        entry,
        calc,
        premiumPay,
      });
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Annual Key Totals Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-xs bg-[#c41230]" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Ετήσιος Απολογισμός Εργασίας & Προσαυξήσεων {year}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Συγκεντρωτικά στοιχεία 12 μηνών και ανάλυση εργασίας σε επίσημες αργίες
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            <Printer className="h-4 w-4 text-slate-400" />
            Εκτύπωση Σύνοψης
          </button>
        </div>

        {/* Annual Metric Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Συνολικές Ώρες</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {Math.round(annualWorkedHours * 10) / 10}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">h ({annualWorkDays} βάρδιες)</span>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/40 p-3">
            <span className="text-xs text-emerald-900 dark:text-emerald-300 font-medium block">Ετήσια Ρεπό</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-200">
                {annualRepoDays}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">ημέρες ανάπαυσης</span>
            </div>
          </div>

          <div className="rounded-lg border border-sky-100 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/40 p-3">
            <span className="text-xs text-sky-900 dark:text-sky-300 font-medium block">Κανονική Άδεια</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-sky-800 dark:text-sky-200">
                {annualAdeiaDays}
              </span>
              <span className="text-xs text-sky-600 dark:text-sky-400">ημέρες άδειας</span>
            </div>
          </div>

          <div className="rounded-lg border border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/40 p-3">
            <span className="text-xs text-purple-900 dark:text-purple-300 font-medium block">Αναρρωτική Άδεια</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-purple-800 dark:text-purple-200">
                {annualSickDays}
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400">ημέρες ασθένειας</span>
            </div>
          </div>

          <div className="rounded-lg border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/40 p-3">
            <span className="text-xs text-indigo-900 dark:text-indigo-300 font-medium block">Νυχτερινά (22:00-06:00)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-indigo-950 dark:text-indigo-100">
                {Math.round((annualNightNormalHours + annualNightHolidayHours) * 10) / 10}
              </span>
              <span className="text-xs text-indigo-700 dark:text-indigo-400">h</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {annualNightNormalHours}h καθ. / {annualNightHolidayHours}h αργ.
            </span>
          </div>

          <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/40 p-3">
            <span className="text-xs text-red-900 dark:text-red-300 font-bold block">Προσαυξήσεις Έτους</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-[#c41230] dark:text-[#ff4d6d]">
                {annualTotalPremiums.toFixed(2)} €
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Μικτές προσαυξήσεις
            </span>
          </div>
        </div>
      </div>

      {/* 12-Month Table Format */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-colors">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 px-5 py-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Πίνακας 12 Μηνών — Ανάλυση 4 Βασικών Κατηγοριών Εργασίας
              </h4>
              <span className="rounded-md bg-[#c41230]/10 text-[#c41230] dark:text-[#ff4d6d] font-mono font-bold px-2 py-0.5 text-xs">
                {year}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Κάντε κλικ σε έναν μήνα για να μεταβείτε απευθείας στην αναλυτική καρτέλα του
            </p>
          </div>

          {onSelectYear && (
            <div className="flex items-center gap-1.5 self-end sm:self-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => onSelectYear(year - 1)}
                title="Προηγούμενο Έτος"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                <Calendar className="h-3.5 w-3.5 text-[#c41230] dark:text-[#ff4d6d]" />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Έτος:</span>
                <select
                  value={year}
                  onChange={(e) => onSelectYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold font-mono text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none pr-1"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => onSelectYear(year + 1)}
                title="Επόμενο Έτος"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5">Μήνας</th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-center">Βάρδιες</th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-center">Ρεπό / Άδεια / Αναρρ.</th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right font-semibold">Σύνολο Ωρών</th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200">
                  1. Νυχτ. Καθημ.
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right bg-purple-50/40 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200">
                  2. Νυχτ. Αργίας
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right bg-amber-50/40 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200">
                  3. Υπερ. Καθημ.
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right bg-rose-50/40 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200">
                  4. Υπερ. Αργίας
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right text-emerald-950 dark:text-emerald-200">
                  Κυρ./Αργ. (+75%)
                </th>
                <th className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                  Προσαυξήσεις (€)
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlySummaries.map((m) => {
                const hasData = m.totalWorkDays > 0;
                return (
                  <tr
                    key={m.month}
                    onClick={() => onSelectMonth(m.month)}
                    className="border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-red-50/30 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{GREEK_MONTHS[m.month]}</span>
                        {hasData && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#c41230]" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{m.hourlyWage.toFixed(2)}€/h</span>
                        {getWagePeriodForDate(`${year}-${String(m.month + 1).padStart(2, '0')}-01`, wageSettings) && (
                          <span className="truncate max-w-[110px] text-slate-400">
                            • {getWagePeriodForDate(`${year}-${String(m.month + 1).padStart(2, '0')}-01`, wageSettings)?.label}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-center font-mono text-slate-800 dark:text-slate-200">
                      {m.totalWorkDays > 0 ? m.totalWorkDays : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-center text-slate-600 dark:text-slate-400 font-mono">
                      {m.totalRepoDays > 0 || m.totalAdeiaDays > 0 || m.totalSickDays > 0
                        ? `${m.totalRepoDays} / ${m.totalAdeiaDays} / ${m.totalSickDays}`
                        : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {m.totalWorkedHours > 0 ? `${m.totalWorkedHours}h` : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300 font-medium">
                      {m.nightNormalHours > 0 ? `${m.nightNormalHours}h` : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono bg-purple-50/20 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300 font-medium">
                      {m.nightHolidayHours > 0 ? `${m.nightHolidayHours}h` : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono bg-amber-50/20 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 font-medium">
                      {m.extraNormalHours > 0 ? `${m.extraNormalHours}h` : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono bg-rose-50/20 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300 font-medium">
                      {m.extraHolidayHours > 0 ? `${m.extraHolidayHours}h` : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono text-emerald-800 dark:text-emerald-300 font-medium">
                      {m.sundayHolidayWorkedHours > 0 ? `${m.sundayHolidayWorkedHours}h` : '—'}
                    </td>

                    <td className="px-3 py-2 text-right font-mono font-bold text-[#c41230] dark:text-[#ff4d6d]">
                      {m.estimatedTotalPremiums > 0
                        ? `+${m.estimatedTotalPremiums.toFixed(2)} €`
                        : '—'}
                    </td>
                  </tr>
                );
              })}

              {/* Annual Totals Row */}
              <tr className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 text-xs">
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 uppercase">
                  ΕΤΗΣΙΑ ΣΥΝΟΛΑ
                </td>
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-center font-mono">
                  {annualWorkDays}
                </td>
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-center font-mono">
                  {annualRepoDays} / {annualAdeiaDays} / {annualSickDays}
                </td>
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-right font-mono font-black text-slate-950 dark:text-slate-50">
                  {Math.round(annualWorkedHours * 10) / 10}h
                </td>
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-right font-mono text-indigo-950 dark:text-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/40">
                  {Math.round(annualNightNormalHours * 10) / 10}h
                </td>
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-right font-mono text-purple-950 dark:text-purple-200 bg-purple-50/60 dark:bg-purple-950/40">
                  {Math.round(annualNightHolidayHours * 10) / 10}h
                </td>
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-right font-mono text-amber-950 dark:text-amber-200 bg-amber-50/60 dark:bg-amber-950/40">
                  {Math.round(annualExtraNormalHours * 10) / 10}h
                </td>
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-right font-mono text-rose-950 dark:text-rose-200 bg-rose-50/60 dark:bg-rose-950/40">
                  {Math.round(annualExtraHolidayHours * 10) / 10}h
                </td>
                <td className="border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-right font-mono text-emerald-950 dark:text-emerald-200">
                  {Math.round(annualSundayHolidayWorkedHours * 10) / 10}h
                </td>
                <td className="px-3 py-3 text-right font-mono font-black text-[#c41230] dark:text-[#ff4d6d]">
                  +{annualTotalPremiums.toFixed(2)} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Specific Requirement: Worked Holidays List (showing worked holidays only) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/30 px-5 py-3 text-xs">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-sm">
              <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Πίνακας Εργασίας σε Αργίες & Κυριακές (Worked Holidays List)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Εμφανίζονται αποκλειστικά οι ημέρες επίσημων αργιών ή Κυριακών όπου καταγράφηκε εργασία ({workedHolidaysList.length} καταγραφές)
            </p>
          </div>
          <span className="rounded-md bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 font-mono text-xs font-semibold text-amber-900 dark:text-amber-200">
            {workedHolidaysList.length} δεδουλευμένες αργίες
          </span>
        </div>

        {workedHolidaysList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            Δεν έχουν καταχωρηθεί βάρδιες που συμπίπτουν με επίσημη αργία ή Κυριακή για το έτος {year}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5">Ημερομηνία</th>
                  <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5">Όνομα Αργίας / Περιγραφή</th>
                  <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-center">Ωράριο Βάρδιας</th>
                  <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right">Ώρες Εργασίας (+75%)</th>
                  <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right">Νυχτερινά Αργίας</th>
                  <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right">Υπερωρία Αργίας</th>
                  <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-right font-bold">Εκτιμώμενη Προσαύξηση</th>
                  <th className="px-3 py-2.5">Σημειώσεις</th>
                </tr>
              </thead>
              <tbody>
                {workedHolidaysList.map((item) => (
                  <tr
                    key={item.dateStr}
                    onClick={() => onSelectDay(item.dateStr)}
                    className="border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 cursor-pointer transition-colors"
                  >
                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {item.dateStr}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 font-medium text-amber-900 dark:text-amber-300">
                      <span className="inline-flex items-center gap-1">
                        <Award className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                        {item.holidayName}
                      </span>
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-center font-mono font-medium text-slate-800 dark:text-slate-200">
                      <div>
                        {item.entry.startTime} - {getFullEndTime(item.entry.endTime || '', item.entry.extraHours)}
                        {item.calc.isOvernight && <span className="ml-1">🌙</span>}
                      </div>
                      {item.entry.extraHours && item.entry.extraHours > 0 ? (
                        <div className="mt-0.5">
                          <span className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                            +{item.entry.extraHours}h υπερ.
                          </span>
                        </div>
                      ) : null}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {item.calc.sundayHolidayWorkedHours}h
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono text-purple-900 dark:text-purple-300">
                      {item.calc.nightHolidayHours > 0 ? `${item.calc.nightHolidayHours}h` : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono text-rose-900 dark:text-rose-300">
                      {item.calc.extraHolidayHours > 0 ? `${item.calc.extraHolidayHours}h` : '—'}
                    </td>

                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-right font-mono font-bold text-[#c41230] dark:text-[#ff4d6d]">
                      +{item.premiumPay.toFixed(2)} €
                    </td>

                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400 italic truncate max-w-xs">
                      {item.entry.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
