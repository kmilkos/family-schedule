<p align="right">
  <strong><a href="README.en.md">🇬🇧 English</a></strong> | <strong>🇬🇷 Ελληνικά</strong>
</p>

# 🏠 Family Schedule

> **Ένα σύγχρονο, αυτόνομο και ενοποιημένο σύστημα οικογενειακού προγραμματισμού με διαχείριση χρηστών, πολλαπλά ημερολόγια, υποστήριξη όλων των μορφών εργασίας, σχολικό ωρολόγιο και έξυπνο βοηθό μετακινήσεων.**

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-f472b6?logo=bun)](https://bun.sh/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Βασικά Χαρακτηριστικά (Features)

### 👥 1. Πλήρης Διαχείριση Χρηστών & Ασφάλεια
- **Οδηγός Πρώτης Εκκίνησης (Setup Wizard)**: Φιλικός οδηγός δημιουργίας του 1ου Διαχειριστή/Γονέα και καθορισμού του ονόματος της οικογένειας κατά την πρώτη εκκίνηση.
- **Ρόλοι & Δικαιώματα (RBAC)**:
  - 🛡️ **Γονέας / Admin**: Πλήρης διαχείριση μελών, δημιουργία ημερολογίων, ρυθμίσεις μισθοδοσίας και πρόσβαση σε όλα τα κοινά δεδομένα.
  - 🎒 **Μέλος / Παιδί**: Πρόσβαση στο δικό του πρόγραμμα, καθήκοντα και στο κοινό οικογενειακό ταμπλό, με προστασία ιδιωτικότητας (απόκρυψη ευαίσθητων οικονομικών στοιχείων τρίτων).
- **Γρήγορη Εναλλαγή Χρήστη (Quick Switch)**: Ιδανικό για κοινόχρηστα tablets / touchscreens στο σπίτι (ψυγείο / τοίχος) με προστασία προαιρετικού 4-6ψήφιου PIN.

---

### 📅 2. Πολλαπλά Ημερολόγια ανά Μέλος (Multi-Calendar)
Κάθε μέλος μπορεί να διατηρεί πολλαπλά, ανεξάρτητα ημερολόγια με διακριτό χρώμα, όνομα και επιλογή **Ορατότητας**:
- **Κοινόχρηστο (Shared with Family)**: Τροφοδοτεί αυτόματα το κεντρικό οικογενειακό ταμπλό και τον Βοηθό Μετακινήσεων.
- **Ιδιωτικό (Private)**: Ορατό αποκλειστικά από τον ίδιο τον χρήστη.

Υποστηρίζονται 3 εξειδικευμένοι τύποι ημερολογίων:
1. **💼 Βάρδιες & Υπερωρίες (Work Shifts)**
2. **🎒 Σχολείο & Δραστηριότητες (Student Schedule)**
3. **📅 Γενικά Γεγονότα / Προσωπικά Ραντεβού (Generic Events)**

---

### 💼 3. Υποστήριξη Όλων των Μορφών Εργασίας
Το σύστημα υποστηρίζει πλήρως κάθε επαγγελματική μορφή απασχόλησης:
- **Πλήρης Απασχόληση (Full-time)**: Σταθερό συνεχές ωράριο 8ωρο / 40h.
- **Μερική Απασχόληση (Part-time)**: 4ωρο, 6ωρο ή προσαρμοσμένο ημερήσιο ωράριο.
- **Κυλιόμενες Βάρδιες (Rotating Shifts)**: Πρωινές, απογευματινές, νυχτερινές βάρδιες, διανυκτερεύσεις (overnight) και κυλιόμενα ρεπό.
- **Σπαστό Ωράριο (Split Shifts)**: Δύο διακριτά σκέλη εργασίας μέσα στην ίδια ημέρα (π.χ. πρωί 09:00–13:00 & απόγευμα 17:00–21:00).
- **Τηλεργασία (Home Office / WFH)**: Ένδειξη εργασίας από το σπίτι χωρίς ανάγκη μετακίνησης.
- **Υβριδική Εργασία (Hybrid)**: Συνδυασμός εργασίας γραφείου και τηλεργασίας ανά ημέρα.
- **Ελεύθερος Επαγγελματίας / Μπλοκάκι**: Ευέλικτο ωράριο και καταγραφή δεδουλευμένων ωρών.
- **Εφημερία / Ετοιμότητα (On-Call / Standby)**: Επιφυλακή και ετοιμότητα επέμβασης.

---

### 💰 4. Μηχανή Υπολογισμού Μισθοδοσίας & Προσαυξήσεων
- Υπολογισμός νυχτερινών ωρών (22:00–06:00) καθημερινής & αργίας (+25%).
- Υπολογισμός εργασίας σε Κυριακές και επίσημες αργίες (+75%).
- Υπολογισμός υπερωριών καθημερινής (+40%) και αργίας (+75%).
- Ετήσιος συγκεντρωτικός πίνακας 12 μηνών και ειδικός πίνακας δεδουλευμένων αργιών (**Worked Holidays List**).
- Αυτόματος συνυπολογισμός υπερωριών στο εμφανιζόμενο ωράριο αποχώρησης (π.χ. `15:00–21:00` με badge `+2h υπερ.`).

---

### 🎒 5. Σχολείο, Εξωσχολικά & Καθήκοντα (Student Hub)
- **Ωρολόγιο Πρόγραμμα**: Υποστήριξη Νηπιαγωγείου, Δημοτικού (βασικό & ολοήμερο), Γυμνασίου και Λυκείου με προσαρμόσιμες διδακτικές ώρες και διαλείμματα.
- **Εξωσχολικές Δραστηριότητες**: Αθλητισμός, ξένες γλώσσες, μουσική, κολυμβητήριο με ώρα έναρξης, λήξης και τοποθεσία.
- **Διαχείριση Εργασιών (Homework Tracker)**: Λίστα καθηκόντων με προθεσμίες, διακριτική επισήμανση μαθήματος και εορταστικό εφέ confetti κατά την ολοκλήρωση.

---

### 🚗 6. Έξυπνος Βοηθός Μετακινήσεων (Smart Ride Assistant)
- **Αυτόματη Ανίχνευση Επικαλύψεων**: Ελέγχει αυτόματα τις ώρες σχολάσματος των παιδιών και τις απογευματινές δραστηριότητες σε σχέση με τις πραγματικές βάρδιες των εργαζομένων.
- **Πρόταση Οδηγού**: Εντοπίζει ποιοι γονείς είναι διαθέσιμοι (λόγω ρεπό, τηλεργασίας ή ελεύθερου ωραρίου) για να αναλάβουν τη μετακίνηση.
- **Ειδοποίηση Σύγκρουσης**: Προειδοποιεί έγκαιρα εάν όλοι οι γονείς εργάζονται την ώρα μιας μετακίνησης.

---

### 🔒 7. 100% Offline & Homelab / Self-Hosted Standards
- **Zero External CDN Dependencies**: Κανένα εξωτερικό font ή script δεν φορτώνεται από τρίτους παρόχους. Όλα τα assets είναι δεσμευμένα τοπικά.
- **Ενιαία Βάση SQLite**: Όλα τα δεδομένα (χρήστες, ημερολόγια, βάρδιες, ρυθμίσεις) αποθηκεύονται σε ένα αρχείο (`data/family_schedule.db`).
- **Nordic Light & Crisp Dark Theme**: Πλήρης υποστήριξη ανοιχτόχρωμου και σκουρόχρωμου θέματος με αυτόματη αποθήκευση επιλογής.
- **Εκτυπώσιμη Μορφή (Print-ready)**: Βελτιστοποιημένη εκτύπωση του εβδομαδιαίου προγράμματος για το ψυγείο ή τον πίνακα ανακοινώσεων.

---

## 🛠️ Τεχνολογικό Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Vite](https://vitejs.dev/), [Lucide React](https://lucide.dev/), Canvas Confetti.
- **Backend**: [Bun](https://bun.sh/), [Express](https://expressjs.com/), [bun:sqlite](https://bun.sh/docs/api/sqlite) (Native High-Speed SQLite).
- **Deployment**: Αυτόνομη υπηρεσία Systemd, υποστήριξη Docker / Nginx reverse proxy.

---

## 🚀 Εγκατάσταση & Εκκίνηση (Quick Start)

### Προαπαιτούμενα
- [Bun](https://bun.sh/) (έκδοση >= 1.0) ή Node.js >= 20

### 1. Κλωνοποίηση & Εγκατάσταση
```bash
git clone https://github.com/kmilkos/family-schedule.git
cd family-schedule
bun install
```

### 2. Μεταγλώττιση (Build)
```bash
bun run build
```

### 3. Εκκίνηση Server
```bash
# Προεπιλεγμένη θύρα 33406 (ή ορίστε PORT=xxxx)
PORT=33406 bun server.ts
```

Η εφαρμογή είναι πλέον διαθέσιμη στο:
`http://localhost:33406`

---

## ⚙️ Ρύθμιση ως Υπηρεσία Systemd (Linux Service)

Δημιουργήστε το αρχείο `/etc/systemd/system/family-schedule.service`:

```ini
[Unit]
Description=Family Schedule - Unified Family Work & School Management
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/family-schedule
ExecStart=/root/.bun/bin/bun server.ts
Restart=always
RestartSec=5
Environment=PORT=33406
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Ενεργοποίηση και εκκίνηση:
```bash
sudo systemctl daemon-reload
sudo systemctl enable family-schedule.service
sudo systemctl start family-schedule.service
sudo systemctl status family-schedule.service
```

---

## 📁 Δομή Αρχείων Έργου

```
family-schedule/
├── data/                      # Βάση δεδομένων SQLite (family_schedule.db)
├── dist/                      # Μεταγλωττισμένο frontend (Vite production build)
├── public/                    # Στατικά αρχεία, έγγραφα & icons
├── src/
│   ├── components/
│   │   ├── auth/              # SetupWizard, UserSwitchModal, UserManagementModal
│   │   ├── calendar/          # CalendarManagerModal (Multi-calendar)
│   │   ├── student/           # Timetable, HomeworkTracker, Activities
│   │   ├── weekly/            # MasterWeeklyView & Smart Ride Assistant
│   │   ├── worker/            # MonthCalendar, DayEditModal, AnnualSummaryView
│   │   └── Header.tsx         # Κεντρική μπάρα πλοήγησης & προφίλ
│   ├── data/                  # Επίσημες αργίες & πρότυπα
│   ├── types/                 # TypeScript interfaces & types
│   ├── utils/                 # Μηχανή υπολογισμών βαρδιών & οικογενειακών logistics
│   ├── App.tsx                # Κεντρικό React Component
│   ├── main.tsx               # React DOM Entrypoint
│   └── index.css              # Tailwind CSS v4 styling
├── package.json
├── server.ts                  # SQLite backend server
├── tsconfig.json
├── vite.config.ts
├── README.md                  # Ελληνική τεκμηρίωση
└── README.en.md               # English documentation
```

---

## 📄 Άδεια Χρήσης (License)
Διατίθεται υπό την άδεια [MIT](LICENSE).
