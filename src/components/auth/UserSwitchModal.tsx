import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { Lock, X, Check, Users, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface UserSwitchModalProps {
  isOpen: boolean;
  users: UserAccount[];
  currentUserId?: string;
  onSelectUser: (user: UserAccount, pin?: string) => Promise<boolean>;
  onClose: () => void;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({
  isOpen,
  users,
  currentUserId,
  onSelectUser,
  onClose,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleUserClick = async (user: UserAccount) => {
    setError(null);
    if (user.hasPin) {
      setSelectedUser(user);
      setPin('');
    } else {
      setIsSubmitting(true);
      const success = await onSelectUser(user);
      setIsSubmitting(false);
      if (success) {
        onClose();
      }
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const success = await onSelectUser(selectedUser, pin);
      if (success) {
        onClose();
      } else {
        setError('Λανθασμένο PIN. Δοκιμάστε ξανά.');
      }
    } catch (err: any) {
      setError(err.message || 'Σφάλμα εισόδου');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Εναλλαγή Χρήστη / Προφίλ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* User Selection Grid */}
        {!selectedUser ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Επιλέξτε το όνομά σας για να συνδεθείτε στα προσωπικά σας ημερολόγια:
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {users.map((u) => {
                const isCurrent = u.id === currentUserId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleUserClick(u)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer group ${
                      isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                        style={{ backgroundColor: `${u.color}20`, borderColor: u.color }}
                      >
                        {u.avatar || '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {u.displayName}
                          </span>
                          {u.role === 'parent' ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                              Γονέας
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              Παιδί
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 truncate block">
                          @{u.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {u.hasPin && (
                        <span className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400" title="Απαιτείται PIN">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                          Ενεργός
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* PIN Input Form for Selected User */
          <form onSubmit={handlePinSubmit} className="mt-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                style={{ backgroundColor: `${selectedUser.color}20`, borderColor: selectedUser.color }}
              >
                {selectedUser.avatar || '👤'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block truncate">
                  {selectedUser.displayName}
                </span>
                <span className="text-xs text-slate-400">Εισάγετε το PIN πρόσβασης</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Αλλαγή
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                PIN Χρήστη
              </label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-xl font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Πίσω
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Έλεγχος...' : 'Είσοδος'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
