import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { MasterWeeklyView } from './components/weekly/MasterWeeklyView';
import { WorkerView } from './components/worker/WorkerView';
import { StudentView } from './components/student/StudentView';
import { AddEditMemberModal } from './components/AddEditMemberModal';
import { SetupWizardModal } from './components/auth/SetupWizardModal';
import { UserSwitchModal } from './components/auth/UserSwitchModal';
import { UserManagementModal } from './components/auth/UserManagementModal';
import { CalendarManagerModal } from './components/calendar/CalendarManagerModal';
import { HouseholdData, FamilyMember, UserAccount, UserCalendar } from './types';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [household, setHousehold] = useState<HouseholdData | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [calendars, setCalendars] = useState<UserCalendar[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'master' | string>('master');

  // Modals state
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isCalendarManagerOpen, setIsCalendarManagerOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [quickEditWorkerDate, setQuickEditWorkerDate] = useState<string | null>(null);

  // Theme state: Nordic Light / Dark Theme, persisted in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('family_schedule_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('family_schedule_theme', theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Fetch users & current auth state
  const fetchAuthAndUsers = useCallback(async () => {
    try {
      // 1. Check system status
      const statusRes = await fetch('/api/system/status');
      const statusData = await statusRes.json();
      if (!statusData.onboardingCompleted) {
        setNeedsSetup(true);
        setIsLoading(false);
        return;
      }
      setNeedsSetup(false);

      // 2. Fetch Users
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const uList: UserAccount[] = await usersRes.json();
        setUsers(uList);

        // 3. Try to get current user from token
        const token = localStorage.getItem('family_schedule_token');
        if (token) {
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUser(meData.user);
          } else {
            // Token expired or invalid, auto select first user if no PIN
            localStorage.removeItem('family_schedule_token');
            if (uList.length > 0 && !uList[0].hasPin) {
              setCurrentUser(uList[0]);
            }
          }
        } else if (uList.length > 0) {
          const firstOpenUser = uList.find((u) => !u.hasPin) || uList[0];
          if (!firstOpenUser.hasPin) {
            setCurrentUser(firstOpenUser);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching auth & users:', e);
    }
  }, []);

  // Fetch calendars
  const fetchCalendars = useCallback(async () => {
    try {
      const res = await fetch('/api/calendars');
      if (res.ok) {
        const data: UserCalendar[] = await res.json();
        setCalendars(data);
      }
    } catch (e) {
      console.error('Error fetching calendars:', e);
    }
  }, []);

  // Fetch consolidated master family data
  const fetchFamilyMaster = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await fetch('/api/family/master');
      if (!res.ok) {
        throw new Error(`Σφάλμα φόρτωσης (${res.status}): ${res.statusText}`);
      }
      const data: HouseholdData = await res.json();
      setHousehold(data);
    } catch (err: any) {
      console.error('Failed to load family master:', err);
      setLoadError(err.message || 'Αποτυχία σύνδεσης με τον διακομιστή.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await fetchAuthAndUsers();
      await fetchCalendars();
      await fetchFamilyMaster();
    };
    init();
  }, [fetchAuthAndUsers, fetchCalendars, fetchFamilyMaster]);

  // Handle Setup Complete
  const handleSetupComplete = (data: { token: string; user: any; familyName: string }) => {
    localStorage.setItem('family_schedule_token', data.token);
    setCurrentUser(data.user);
    setNeedsSetup(false);
    fetchAuthAndUsers();
    fetchCalendars();
    fetchFamilyMaster();
  };

  // Handle Quick Switch / User Login
  const handleSelectUser = async (user: UserAccount, pin?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/quick-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        return false;
      }

      localStorage.setItem('family_schedule_token', data.token);
      setCurrentUser(data.user);
      return true;
    } catch (err) {
      console.error('Quick switch error:', err);
      return false;
    }
  };

  // Update a single family member's shifts or details
  const handleUpdateMember = useCallback(async (updatedMember: FamilyMember) => {
    // 1. Optimistic UI update
    setHousehold((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((m) => (m.id === updatedMember.id ? updatedMember : m)),
      };
    });

    // 2. Persist to API
    try {
      setIsSaving(true);
      const userCal = calendars.find((c) => c.userId === updatedMember.id && c.type === 'WORK_SHIFTS');
      if (userCal && updatedMember.workerData?.shifts) {
        // Find latest shift updated
        const shifts = updatedMember.workerData.shifts;
        const latestDate = Object.keys(shifts).sort().reverse()[0];
        if (latestDate && shifts[latestDate]) {
          await fetch(`/api/calendars/${userCal.id}/shifts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shifts[latestDate]),
          });
        }
      }
      await fetchFamilyMaster();
    } catch (err) {
      console.error('Failed to update member shift:', err);
    } finally {
      setIsSaving(false);
    }
  }, [calendars, fetchFamilyMaster]);

  // Save new member profile
  const handleSaveMemberProfile = useCallback(async (savedMember: FamilyMember) => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('family_schedule_token') || ''}`,
        },
        body: JSON.stringify({
          displayName: savedMember.name,
          username: savedMember.name.toLowerCase().replace(/\s+/g, ''),
          role: savedMember.role === 'worker' ? 'parent' : 'child',
          avatar: savedMember.avatar,
          color: savedMember.color,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Σφάλμα αποθήκευσης');
      }

      await fetchAuthAndUsers();
      await fetchCalendars();
      await fetchFamilyMaster();
      setActiveTab(savedMember.id);
    } catch (err: any) {
      alert(err.message || 'Αποτυχία προσθήκης μέλους');
    } finally {
      setIsSaving(false);
    }
  }, [fetchAuthAndUsers, fetchCalendars, fetchFamilyMaster]);

  // Delete family member
  const handleDeleteMember = useCallback(async (memberId: string) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το μέλος;')) return;

    try {
      setIsSaving(true);
      await fetch(`/api/users/${memberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('family_schedule_token') || ''}`,
        },
      });
      await fetchAuthAndUsers();
      await fetchCalendars();
      await fetchFamilyMaster();
      setActiveTab('master');
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      setIsSaving(false);
    }
  }, [fetchAuthAndUsers, fetchCalendars, fetchFamilyMaster]);

  // Quick edit shift from weekly view
  const handleQuickEditShift = useCallback((memberId: string, dateStr: string) => {
    setActiveTab(memberId);
    setQuickEditWorkerDate(dateStr);
  }, []);

  // Update Family Notes
  const handleUpdateFamilyNotes = useCallback(async (notes: any[]) => {
    setHousehold((prev) => (prev ? { ...prev, familyNotes: notes } : prev));
  }, []);

  // Active member for single view
  const activeMember = household?.members.find((m) => m.id === activeTab);

  if (needsSetup) {
    return (
      <SetupWizardModal
        isOpen={needsSetup}
        onSetupComplete={handleSetupComplete}
      />
    );
  }

  if (isLoading && !household) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-lg font-bold">Φόρτωση Family Schedule...</h2>
        <p className="text-xs text-slate-400 mt-1">Σύνδεση με βάση δεδομένων SQLite</p>
      </div>
    );
  }

  if (loadError && !household) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="bg-slate-800 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-rose-200">Σφάλμα Σύνδεσης</h2>
          <p className="text-xs text-slate-400">{loadError}</p>
          <button
            onClick={() => {
              fetchAuthAndUsers();
              fetchFamilyMaster();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Επανάληψη Σύνδεσης
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {household && (
        <Header
          household={household}
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setQuickEditWorkerDate(null);
          }}
          onOpenAddMember={() => {
            setEditingMember(null);
            setIsAddMemberOpen(true);
          }}
          onOpenUserSwitch={() => setIsUserSwitchOpen(true)}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenCalendarManager={() => setIsCalendarManagerOpen(true)}
          onRefresh={() => {
            fetchAuthAndUsers();
            fetchCalendars();
            fetchFamilyMaster();
          }}
          isSaving={isSaving}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {household && activeTab === 'master' && (
          <MasterWeeklyView
            members={household.members}
            holidays={household.holidays}
            familyNotes={household.familyNotes}
            onUpdateFamilyNotes={handleUpdateFamilyNotes}
            onUpdateMember={handleUpdateMember}
            onQuickEditShift={handleQuickEditShift}
            onSelectMember={(memberId) => setActiveTab(memberId)}
            onRefresh={() => {
              fetchAuthAndUsers();
              fetchFamilyMaster();
            }}
          />
        )}

        {/* Worker Member View */}
        {household && activeMember && activeMember.role === 'worker' && (
          <WorkerView
            member={activeMember}
            holidays={household.holidays}
            onUpdateMember={handleUpdateMember}
            onUpdateHolidays={(hols) => setHousehold((prev) => (prev ? { ...prev, holidays: hols } : prev))}
            onEditProfile={() => {
              setEditingMember(activeMember);
              setIsAddMemberOpen(true);
            }}
            onDeleteMember={() => handleDeleteMember(activeMember.id)}
            canDelete={household.members.length > 1}
            initialSelectedDate={quickEditWorkerDate}
          />
        )}

        {/* Student Member View */}
        {household && activeMember && activeMember.role === 'student' && (
          <StudentView
            member={activeMember}
            onUpdateMember={handleUpdateMember}
            onEditProfile={() => {
              setEditingMember(activeMember);
              setIsAddMemberOpen(true);
            }}
            onDeleteMember={() => handleDeleteMember(activeMember.id)}
            canDelete={household.members.length > 1}
          />
        )}
      </main>

      {/* Modals */}
      <UserSwitchModal
        isOpen={isUserSwitchOpen}
        users={users}
        currentUserId={currentUser?.id}
        onSelectUser={handleSelectUser}
        onClose={() => setIsUserSwitchOpen(false)}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        users={users}
        currentUser={currentUser}
        onRefreshUsers={() => {
          fetchAuthAndUsers();
          fetchFamilyMaster();
        }}
        onClose={() => setIsUserManagementOpen(false)}
      />

      <CalendarManagerModal
        isOpen={isCalendarManagerOpen}
        user={currentUser}
        calendars={calendars}
        onRefreshCalendars={() => {
          fetchCalendars();
          fetchFamilyMaster();
        }}
        onClose={() => setIsCalendarManagerOpen(false)}
      />

      {isAddMemberOpen && (
        <AddEditMemberModal
          member={editingMember}
          onSave={handleSaveMemberProfile}
          onClose={() => {
            setIsAddMemberOpen(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}
