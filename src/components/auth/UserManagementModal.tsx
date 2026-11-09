import React, { useState } from 'react';
import { UserAccount, UserRole } from '../../types';
import { X, Plus, Trash2, Edit3, ShieldCheck, UserCheck, Lock, User, Check } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  users: UserAccount[];
  currentUser: UserAccount | null;
  onRefreshUsers: () => void;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️', '🎒', '🎨', '⚽', '🧸', '🎮', '📚'];
const COLOR_OPTIONS = ['#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1', '#14b8a6'];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  users,
  currentUser,
  onRefreshUsers,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [pin, setPin] = useState('');
  const [avatar, setAvatar] = useState('👨‍💼');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'parent';

  const resetForm = () => {
    setIsAdding(false);
    setEditingUserId(null);
    setDisplayName('');
    setUsername('');
    setRole('parent');
    setPin('');
    setAvatar('👨‍💼');
    setColor('#3b82f6');
    setError(null);
  };

  const startEdit = (u: UserAccount) => {
    setEditingUserId(u.id);
    setIsAdding(false);
    setDisplayName(u.displayName);
    setUsername(u.username);
    setRole(u.role);
    setPin('');
    setAvatar(u.avatar || '👤');
    setColor(u.color || '#3b82f6');
    setError(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || (!editingUserId && !username.trim())) {
      setError('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = localStorage.getItem('family_schedule_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let url = '/api/users';
      let method = 'POST';

      if (editingUserId) {
        url = `/api/users/${editingUserId}`;
        method = 'PUT';
      }

      const payload: any = {
        displayName: displayName.trim(),
        role,
        avatar,
        color,
      };

      if (!editingUserId) {
        payload.username = username.trim().toLowerCase();
      }

      if (pin.trim()) {
        payload.pin = pin.trim();
      } else if (editingUserId && pin === '') {
        // Leave unchanged if editing and pin left blank
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Σφάλμα κατά την αποθήκευση μέλους');
      }

      onRefreshUsers();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Αποτυχία');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το μέλος "${name}";`)) return;

    try {
      const token = localStorage.getItem('family_schedule_token');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Σφάλμα διαγραφής');
      onRefreshUsers();
    } catch (err: any) {
      alert(err.message || 'Αποτυχία διαγραφής');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Διαχείριση Μελών Οικογένειας (User Management)
              </h3>
              <p className="text-xs text-slate-400">Ρόλοι, PINs & Προφίλ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Add / Edit Form */}
          {(isAdding || editingUserId) ? (
            <form onSubmit={handleSaveUser} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {editingUserId ? 'Επεξεργασία Μέλους' : 'Προσθήκη Νέου Μέλους'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Ακύρωση
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Ονοματεπώνυμο
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (!editingUserId && !username) {
                        setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                      }
                    }}
                    placeholder="π.χ. Μαρία"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {!editingUserId && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Όνομα Χρήστη (Username)
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="π.χ. maria"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Ρόλος στην Οικογένεια
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="parent">Γονέας / Διαχειριστής (Πλήρης Πρόσβαση)</option>
                    <option value="child">Μέλος / Παιδί (Πρόγραμμα & Σχολείο)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {editingUserId ? 'Νέο PIN (κενό για διατήρηση)' : 'PIN Εισόδου (Προαιρετικό)'}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="π.χ. 1234"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Avatar & Color Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Avatar
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {AVATAR_OPTIONS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAvatar(a)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition cursor-pointer ${
                          avatar === a ? 'bg-indigo-600 text-white shadow-xs' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Χρώμα Προφίλ
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full transition cursor-pointer border-2 ${
                          color === c ? 'border-slate-900 dark:border-white scale-110 shadow-xs' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Αποθήκευση...' : 'Αποθήκευση Μέλους'}</span>
                </button>
              </div>
            </form>
          ) : (
            isAdmin && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Προσθήκη Νέου Μέλους Οικογένειας</span>
              </button>
            )
          )}

          {/* Members List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Εγγεγραμμένα Μέλη ({users.length})
            </span>
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
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
                          Γονέας / Admin
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Παιδί / Μέλος
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>@{u.username}</span>
                      <span>•</span>
                      <span>{u.hasPin ? '🔒 Προστασία με PIN' : '🔓 Χωρίς PIN'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(u)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Επεξεργασία"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {isAdmin && currentUser?.id !== u.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id, u.displayName)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Διαγραφή μέλους"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  );
};
