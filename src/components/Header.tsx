import React from 'react';
import { Home, Calendar, Printer, RefreshCw, Plus, Sun, Moon, Users, UserCheck, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { HouseholdData, UserAccount } from '../types';

interface HeaderProps {
  household: HouseholdData;
  currentUser: UserAccount | null;
  activeTab: 'master' | string; // 'master' or memberId
  onSelectTab: (tabId: string) => void;
  onOpenAddMember: () => void;
  onOpenUserSwitch: () => void;
  onOpenUserManagement: () => void;
  onOpenCalendarManager: () => void;
  onRefresh: () => void;
  isSaving: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  household,
  currentUser,
  activeTab,
  onSelectTab,
  onOpenAddMember,
  onOpenUserSwitch,
  onOpenUserManagement,
  onOpenCalendarManager,
  onRefresh,
  isSaving,
  theme,
  onToggleTheme,
}) => {
  const workers = household.members.filter((m) => m.role === 'worker');
  const students = household.members.filter((m) => m.role === 'student');
  const isAdmin = currentUser?.role === 'parent';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs dark:shadow-md transition-colors no-print">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0">
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate leading-tight">
              {household.householdName || 'Family Schedule'}
            </h1>
          </div>
        </div>

        {/* Global Action Buttons & User Profile Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isSaving && (
            <span className="text-[11px] text-amber-500 dark:text-amber-400 flex items-center gap-1 font-mono mr-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping"></span>
              <span className="hidden sm:inline">Αποθήκευση...</span>
            </span>
          )}

          {/* Current User Quick Switch Button */}
          {currentUser && (
            <button
              type="button"
              onClick={onOpenUserSwitch}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition cursor-pointer text-xs"
              title="Εναλλαγή συνδεδεμένου χρήστη"
            >
              <span className="text-sm">{currentUser.avatar || '👤'}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 hidden sm:inline">
                {currentUser.displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">⇄</span>
            </button>
          )}

          {/* User Management Button (Parent/Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenUserManagement}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer text-xs font-semibold flex items-center gap-1"
              title="Διαχείριση χρηστών & PINs (Admin)"
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden md:inline">Χρήστες</span>
            </button>
          )}

          {/* Calendar Manager Button */}
          {currentUser && (
            <button
              type="button"
              onClick={onOpenCalendarManager}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer text-xs font-semibold flex items-center gap-1"
              title="Διαχείριση πολλαπλών ημερολογίων"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden md:inline">Ημερολόγια</span>
            </button>
          )}

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title={theme === 'dark' ? 'Εναλλαγή σε Nordic Crisp Light' : 'Εναλλαγή σε Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
            )}
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer"
            title="Εκτύπωση εβδομαδιαίου προγράμματος"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden md:inline">Εκτύπωση</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Ανανέωση δεδομένων"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* New Member Button (Admin only) */}
          {isAdmin && (
            <button
              onClick={onOpenAddMember}
              className="p-1.5 sm:px-3 sm:py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              title="Προσθήκη νέου μέλους"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Νέο Μέλος</span>
            </button>
          )}
        </div>
      </div>

      {/* Member Navigation Pills */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-2 pt-0.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-xs scrollbar-none">
        {/* Master Plan Button */}
        <button
          onClick={() => onSelectTab('master')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeTab === 'master'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/25 scale-[1.01]'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>🏠 Κοινό Οικογενειακό Πρόγραμμα</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 mx-0.5 shrink-0" />

        {/* Members List */}
        <div className="flex items-center gap-1.5 shrink-0">
          {household.members.map((m) => {
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectTab(m.id)}
                className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-2 border-sky-500 shadow-xs shadow-sky-500/10 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/70 dark:border-slate-700/50'
                }`}
              >
                <span>{m.avatar || (m.role === 'worker' ? '👨‍💼' : '🎒')}</span>
                <span>{m.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({m.role === 'worker' ? 'Εργασία' : 'Σχολείο'})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
