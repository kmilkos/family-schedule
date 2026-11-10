<p align="right">
  <strong>🇬🇧 English</strong> | <strong><a href="README.md">🇬🇷 Ελληνικά</a></strong>
</p>

# 🏠 Family Schedule

> **A modern, self-hosted, all-in-one family scheduling system featuring multi-user management, custom personal calendars, support for all work arrangements, school timetables, and an intelligent ride assistant.**

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-f472b6?logo=bun)](https://bun.sh/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Key Features

### 👥 1. Comprehensive User Management & Security
- **Initial Setup Wizard**: On first run, a friendly onboarding wizard guides the creation of the first Parent/Admin account and family name.
- **Roles & Permissions (RBAC)**:
  - 🛡️ **Parent / Admin**: Full administrative control over users, calendar creation, payroll/wage calculation settings, and access to all shared family data.
  - 🎒 **Member / Child**: Access to personal schedules, tasks, homework, and the shared family dashboard, with privacy protection (sensitive financial and wage details of others are hidden).
- **Quick Profile Switcher**: Designed for shared home tablets or wall-mounted touchscreens (e.g. kitchen/fridge displays) with optional 4–6 digit PIN protection.

---

### 📅 2. Multi-Calendar System per Member
Each family member can create and manage multiple independent calendars with custom colors, names, and **Visibility settings**:
- **Shared with Family**: Automatically feeds into the Master Family Weekly Dashboard and the Ride Assistant.
- **Private**: Visible solely to the owner.

Supports 3 specialized calendar types:
1. **💼 Work Shifts & Overtime**
2. **🎒 Student Schedule & Extracurriculars**
3. **📅 Generic Events & Personal Appointments**

---

### 💼 3. Full Support for All Work Arrangements
The system accommodates any employment model and contract type:
- **Full-time (8h / 40h weekly)**: Standard continuous daytime schedule.
- **Part-time (4h, 6h, or custom)**: Reduced daily work hours.
- **Rotating Shifts**: Morning, afternoon, night shifts, overnight shifts spanning past midnight, and rotating days off.
- **Split Shifts (Σπαστό Ωράριο)**: Two distinct work blocks in a single day (e.g. morning 09:00–13:00 & evening 17:00–21:00).
- **Remote / Work from Home (WFH)**: Flags days worked from home, eliminating commute requirements.
- **Hybrid Work**: Seamlessly mix office days with remote days.
- **Freelance / Contractor**: Flexible hours with project time tracking.
- **On-Call / Standby (Εφημερία)**: On-call availability and emergency response shifts.

---

### 💰 4. Wage, Overtime & Premium Calculation Engine
- Automatic calculation of night differential hours (22:00–06:00, +25%).
- Sunday and official public holiday work premium (+75%).
- Overtime calculation for weekdays (+40%) and holidays/weekends (+75%).
- 12-month consolidated annual summary and dedicated **Worked Holidays List**.
- Real-time departure time adjustment reflecting overtime (e.g., base shift `15:00–19:00` + `2h` overtime $\rightarrow$ displays full span `15:00–21:00` with `+2h over.` badge).

---

### 🎒 5. Student Hub & Extracurriculars
- **Timetable Grid**: Supports Kindergarten, Primary (standard & all-day), Gymnasium, and Lyceum with customizable periods, subjects, and breaks.
- **Extracurricular Activities**: Sports, foreign languages, music, swimming with start/end times and locations.
- **Homework & Task Tracker**: Due dates, subject badges, and an interactive celebration with confetti upon task completion.

---

### 🚗 6. Smart Ride Assistant & Logistics
- **Automated Conflict Detection**: Compares school dismissal times and afternoon activities against parent work shifts in real time.
- **Available Driver Suggestion**: Identifies which parents are available (due to days off, teleworking, or free windows) to handle rides.
- **Collision Warning**: Proactively alerts the family when all parents are on shift during a child transit commitment.

---

### 🔒 7. 100% Offline & Homelab / Self-Hosted Standards
- **Zero External CDN Dependencies**: All assets, fonts, icons, and scripts are bundled locally for 100% air-gapped / offline LAN reliability.
- **Single-File SQLite Backend**: Everything (users, calendars, shifts, events, notes) is safely persisted in `data/family_schedule.db` using WAL mode and foreign key constraints.
- **Nordic Light & Crisp Dark Theme**: High-contrast, elegant theme toggling with persistent user preference.
- **Print-Ready Layout**: Clean, optimized CSS print styling for weekly fridge schedules.

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Vite](https://vitejs.dev/), [Lucide React](https://lucide.dev/), Canvas Confetti.
- **Backend**: [Bun](https://bun.sh/), [Express](https://expressjs.com/), [bun:sqlite](https://bun.sh/docs/api/sqlite) (Native High-Speed SQLite).
- **Deployment**: Standalone Systemd service, Docker / Nginx reverse proxy compatible.

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (>= 1.0) or Node.js >= 20

### 1. Clone & Install
```bash
git clone https://github.com/kmilkos/family-schedule.git
cd family-schedule
bun install
```

### 2. Build Frontend
```bash
bun run build
```

### 3. Start the Server
```bash
# Default port: 33406 (or set PORT=xxxx)
PORT=33406 bun server.ts
```

Open your browser at:
`http://localhost:33406`

---

## ⚙️ Running as a Systemd Service (Linux)

Create `/etc/systemd/system/family-schedule.service`:

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

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable family-schedule.service
sudo systemctl start family-schedule.service
sudo systemctl status family-schedule.service
```

---

## 📁 Repository Structure

```
family-schedule/
├── data/                      # SQLite database storage (family_schedule.db)
├── dist/                      # Compiled frontend assets (Vite production build)
├── public/                    # Static assets, icons, document templates
├── src/
│   ├── components/
│   │   ├── auth/              # SetupWizard, UserSwitchModal, UserManagementModal
│   │   ├── calendar/          # CalendarManagerModal (Multi-calendar)
│   │   ├── student/           # Timetable, HomeworkTracker, Activities
│   │   ├── weekly/            # MasterWeeklyView & Smart Ride Assistant
│   │   ├── worker/            # MonthCalendar, DayEditModal, AnnualSummaryView
│   │   └── Header.tsx         # Navigation bar, profile badge & actions
│   ├── data/                  # Official public holidays & presets
│   ├── types/                 # TypeScript interfaces & types
│   ├── utils/                 # Shift calculations & family logistics engine
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application bootstrap
│   └── index.css              # Tailwind CSS v4 design tokens & base styles
├── package.json
├── server.ts                  # SQLite backend server
├── tsconfig.json
├── vite.config.ts
├── README.md                  # Greek documentation
└── README.en.md               # English documentation
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
