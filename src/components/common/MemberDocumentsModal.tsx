import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Copy,
  Check,
  Plus,
  FileSpreadsheet,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { FamilyMember, MemberDocument, EmploymentInfo } from '../../types';

interface MemberDocumentsModalProps {
  isOpen: boolean;
  member: FamilyMember;
  onClose: () => void;
  onUpdateMember: (updated: FamilyMember) => void;
}

export const MemberDocumentsModal: React.FC<MemberDocumentsModalProps> = ({
  isOpen,
  member,
  onClose,
  onUpdateMember,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProtocol, setNewProtocol] = useState('');
  const [newCategory, setNewCategory] = useState<MemberDocument['category']>('contract');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const docs = member.workerData?.documents || member.documents || [];
  const empInfo: EmploymentInfo | undefined = member.workerData?.employmentInfo;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDoc: MemberDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      protocolNumber: newProtocol.trim() || undefined,
      submissionDate: new Date().toLocaleDateString('el-GR'),
      notes: newNotes.trim() || undefined,
      uploadedAt: new Date().toISOString(),
    };

    const updatedDocs = [...docs, newDoc];

    onUpdateMember({
      ...member,
      documents: updatedDocs,
      workerData: member.workerData
        ? {
            ...member.workerData,
            documents: updatedDocs,
          }
        : undefined,
    });

    setNewTitle('');
    setNewProtocol('');
    setNewNotes('');
    setShowAddForm(false);
  };

  return (
    <div
      id="member-documents-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        id="member-documents-modal-dialog"
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-xs"
              style={{ backgroundColor: `${member.color}20`, borderColor: member.color }}
            >
              {member.avatar || '👨‍💼'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Έγγραφα & Σύμβαση Εργασίας
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {member.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Επίσημα έγγραφα ΕΡΓΑΝΗ, στοιχεία σύμβασης & αρχείο δικαιολογητικών
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Κλείσιμο"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Employment Contract Status Card */}
        {empInfo && (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Στοιχεία Εργασιακής Σχέσης (ΕΡΓΑΝΗ ΙΙ)
                </span>
              </div>
              {empInfo.contractDuration && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Ισχύς: {empInfo.contractDuration}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-sky-500" />
                  <span>Έμμεσος Εργοδότης (Χρήστης)</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  {empInfo.employer}
                </div>
                {empInfo.employerAfm && (
                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>ΑΦΜ: {empInfo.employerAfm}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(empInfo.employerAfm!, 'afm-ind')}
                      className="text-slate-400 hover:text-amber-500 transition-colors p-0.5"
                      title="Αντιγραφή ΑΦΜ"
                    >
                      {copiedField === 'afm-ind' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-amber-500" />
                  <span>Άμεσος Εργοδότης (Ε.Π.Α.)</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  {empInfo.directEmployer || 'ΜΕΛΛΟΝ Α.Ε. ΠΡΟΣΩΡΙΝΗΣ ΑΠΑΣΧΟΛΗΣΗΣ'}
                </div>
                {empInfo.directEmployerAfm && (
                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>ΑΦΜ: {empInfo.directEmployerAfm}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(empInfo.directEmployerAfm!, 'afm-dir')}
                      className="text-slate-400 hover:text-amber-500 transition-colors p-0.5"
                      title="Αντιγραφή ΑΦΜ"
                    >
                      {copiedField === 'afm-dir' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1">
                <div className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Μεικτές Αποδοχές & Ωρομίσθιο</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <span>{empInfo.monthlySalary ? `${empInfo.monthlySalary.toFixed(2)} €` : '1.154,00 €'}</span>
                  <span className="text-xs font-mono font-normal text-emerald-600 dark:text-emerald-400">
                    ({empInfo.hourlyWage ? `${empInfo.hourlyWage.toFixed(2)} €/ώρα` : '6,92 €/ώρα'})
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Προϋπηρεσία: 5 έτη • Καταβολή τέλος μήνα
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Τόπος Εργασίας / Παράρτημα</span>
                </div>
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {empInfo.workplace}
                </div>
                {empInfo.specialityName && (
                  <div className="text-[11px] text-slate-500">
                    Ειδικότητα: <span className="font-mono text-slate-400">{empInfo.specialityCode}</span> ({empInfo.specialityName})
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 sm:col-span-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  <span>Όροι, Ωράριο & Ψηφιακή Οργάνωση</span>
                </div>
                <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold">{empInfo.weeklyHours || 40}h / εβδομάδα</span>
                  <span className="text-slate-400">•</span>
                  <span>5νθήμερο (8ωρο)</span>
                  <span className="text-slate-400">•</span>
                  <span>Διάλειμμα 30' (εντός)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] pt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-300 font-bold border border-sky-500/20">
                    Ψηφιακό Ωράριο: ΝΑΙ
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/20">
                    Κάρτα Εργασίας: ΝΑΙ
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Attached Documents List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Αρχειοθετημένα Έγγραφα ({docs.length})</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-500" />
              <span>Προσθήκη Εγγράφου</span>
            </button>
          </div>

          {/* Add Document Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddDocument}
              className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-3 animate-fadeIn"
            >
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Καταχώρηση Νέου Εγγράφου
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Τίτλος Εγγράφου *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="π.χ. Βεβαίωση Προϋπηρεσίας, Σύμβαση"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Αριθμός Πρωτοκόλλου
                  </label>
                  <input
                    type="text"
                    value={newProtocol}
                    onChange={(e) => setNewProtocol(e.target.value)}
                    placeholder="π.χ. ΜΤ3366591"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Κατηγορία
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="contract">Σύμβαση Εργασίας</option>
                    <option value="ergani">ΕΡΓΑΝΗ / Υπουργείο Εργασίας</option>
                    <option value="tax">Φορολογικό / Βεβαίωση</option>
                    <option value="medical">Ιατρικό / Άδεια</option>
                    <option value="certificate">Πιστοποιητικό</option>
                    <option value="other">Άλλο</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Σημειώσεις
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="π.χ. Υποβλήθηκε ηλεκτρονικά"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Άκυρο
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors"
                >
                  Αποθήκευση
                </button>
              </div>
            </form>
          )}

          {docs.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
              Δεν έχουν καταχωρηθεί έγγραφα ακόμη.
            </div>
          ) : (
            <div className="space-y-2.5">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 mt-0.5 border border-amber-500/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {doc.title}
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-mono font-semibold uppercase bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                            {doc.category}
                          </span>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                          {doc.protocolNumber && (
                            <div className="flex items-center gap-1 font-mono">
                              <span className="text-slate-400">Πρωτόκολλο:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {doc.protocolNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(doc.protocolNumber!, `prot-${doc.id}`)}
                                className="text-slate-400 hover:text-amber-500 transition-colors p-0.5"
                                title="Αντιγραφή Αρ. Πρωτοκόλλου"
                              >
                                {copiedField === `prot-${doc.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}

                          {doc.submissionDate && (
                            <div>
                              <span>Υποβολή: </span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {doc.submissionDate}
                              </span>
                            </div>
                          )}

                          {doc.expiryDate && (
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                              <span>Ισχύς έως: {doc.expiryDate}</span>
                            </div>
                          )}
                        </div>

                        {doc.workScheduleSummary && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 mt-1">
                            {doc.workScheduleSummary}
                          </div>
                        )}

                        {doc.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            {doc.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {doc.fileUrl && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/15 dark:hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Άνοιγμα PDF σε νέα καρτέλα"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Προβολή</span>
                        </a>
                        <a
                          href={doc.fileUrl}
                          download={doc.fileName || 'document.pdf'}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="Λήψη PDF αρχείου"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Ασφαλής τοπική αποθήκευση στο HouseSchedule
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Εντάξει
          </button>
        </div>
      </div>
    </div>
  );
};
