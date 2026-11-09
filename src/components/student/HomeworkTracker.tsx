import React, { useState } from 'react';
import { HomeworkTask, Subject } from '../../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  BookOpen,
  Filter,
} from 'lucide-react';

interface HomeworkTrackerProps {
  tasks: HomeworkTask[];
  subjects: Subject[];
  onAddTask: (task: Omit<HomeworkTask, 'id' | 'createdAt'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const HomeworkTracker: React.FC<HomeworkTrackerProps> = ({
  tasks,
  subjects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'pending' | 'tomorrow' | 'all' | 'completed'>('pending');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [newPriority, setNewPriority] = useState<'low' | 'normal' | 'high'>('normal');

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const handleToggle = (id: string, isDone: boolean) => {
    if (!isDone) {
      // Trigger festive celebration!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    onToggleTask(id);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      subjectId: newSubjectId || subjects[0]?.id || '',
      title: newTitle.trim(),
      dueDate: newDueDate,
      completed: false,
      priority: newPriority,
    });

    setNewTitle('');
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'tomorrow') return task.dueDate === tomorrowStr && !task.completed;
    return true; // all
  });

  return (
    <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs dark:shadow-xl overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-inner">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Καθήκοντα & Εργασίες
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-[10px] font-mono font-bold">
                    {pendingCount} εκκρεμή
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Σημειώστε ασκήσεις, διαγωνίσματα και προθεσμίες
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="sm:hidden px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 flex items-center gap-1 shadow-md transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Νέο</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Filter tabs */}
          <div className="grid grid-cols-4 sm:flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 w-full sm:w-auto text-center">
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'pending' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Εκκρεμή
            </button>
            <button
              type="button"
              onClick={() => setFilter('tomorrow')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'tomorrow' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Αύριο
            </button>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Όλα
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'completed' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Έτοιμα
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Νέο Καθήκον</span>
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 animate-fadeIn space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Μάθημα</label>
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Περιγραφή Εργασίας / Άσκησης</label>
              <input
                type="text"
                required
                placeholder="π.χ. Ασκήσεις 1-4 σελίδα 45 στο τετράδιο"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Προθεσμία</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2 flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Προσθήκη
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Ακύρωση
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
        {filteredTasks.map((task) => {
          const subject = subjects.find((s) => s.id === task.subjectId);
          const isOverdue = task.dueDate < todayStr && !task.completed;
          const isTomorrow = task.dueDate === tomorrowStr;

          return (
            <div
              key={task.id}
              className={`p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                task.completed ? 'opacity-60 bg-slate-50/60 dark:bg-slate-950/40' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id, task.completed)}
                  className="text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors shrink-0 cursor-pointer"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600 hover:text-emerald-500" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {subject && (
                      <span
                        style={{
                          backgroundColor: `${subject.color}20`,
                          color: subject.color,
                          borderColor: subject.color,
                        }}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1"
                      >
                        <span>{subject.icon}</span>
                        <span>{subject.name}</span>
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold text-slate-900 dark:text-slate-100 ${
                        task.completed ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>{task.dueDate}</span>
                    </span>
                    {isTomorrow && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 font-semibold text-[10px]">
                        Για Αύριο
                      </span>
                    )}
                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-semibold text-[10px] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Εκπρόθεσμο
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Διαγραφή καθήκοντος"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            {filter === 'completed'
              ? 'Δεν υπάρχουν ολοκληρωμένες εργασίες ακόμη.'
              : 'Δεν υπάρχουν εκκρεμείς εργασίες! Καλή ξεκούραση! 🎉'}
          </div>
        )}
      </div>
    </div>
  );
};
