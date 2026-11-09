import React, { useState } from 'react';
import { Home, ShieldCheck, UserCheck, Sparkles, ArrowRight, Lock } from 'lucide-react';

interface SetupWizardModalProps {
  isOpen: boolean;
  onSetupComplete: (data: { token: string; user: any; familyName: string }) => void;
}

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({ isOpen, onSetupComplete }) => {
  const [familyName, setFamilyName] = useState('Οικογένεια');
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminUsername.trim()) {
      setError('Παρακαλώ συμπληρώστε το όνομα και το username.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/system/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyName: familyName.trim() || 'Οικογένεια',
          adminName: adminName.trim(),
          adminUsername: adminUsername.trim().toLowerCase(),
          adminPin: adminPin.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Σφάλμα κατά την αρχική ρύθμιση');
      }

      onSetupComplete(data);
    } catch (err: any) {
      setError(err.message || 'Αποτυχία αρχικοποίησης.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 animate-fadeIn">
        {/* Welcome Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 text-white shadow-lg shadow-indigo-500/25 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Καλωσήρθατε στο Family Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Αρχική ρύθμιση οικογενειακού προγράμματος & δημιουργία 1ου Διαχειριστή.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              🏠 Όνομα Οικογένειας / Σπιτιού
            </label>
            <input
              type="text"
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="π.χ. Οικογένεια Παπαδοπούλου"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Στοιχεία 1ου Διαχειριστή / Γονέα</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Ονοματεπώνυμο
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => {
                    setAdminName(e.target.value);
                    if (!adminUsername) {
                      setAdminUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    }
                  }}
                  placeholder="π.χ. Γιάννης"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Όνομα Χρήστη (Username)
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="π.χ. giannis"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>PIN / Κωδικός Εισόδου (Προαιρετικό)</span>
                <span className="text-[10px] text-slate-400">4-6 ψηφία για γρήγορη είσοδο</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="π.χ. 1234 (κενό για είσοδο χωρίς PIN)"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Δημιουργία...' : 'Έναρξη Εφαρμογής'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
