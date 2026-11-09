import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { Database } from 'bun:sqlite';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '33406', 10);

const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'family_schedule.db');
const db = new Database(DB_PATH, { create: true });

// Enable foreign keys & WAL mode for high concurrency
db.run('PRAGMA foreign_keys = ON;');
db.run('PRAGMA journal_mode = WAL;');

// Initialize Schema
db.run(`
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  displayName TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('parent', 'child')),
  pinHash TEXT,
  avatar TEXT,
  color TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS calendars (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('WORK_SHIFTS', 'STUDENT_SCHEDULE', 'GENERIC_EVENTS')),
  color TEXT NOT NULL,
  isSharedWithFamily BOOLEAN DEFAULT 1,
  workArrangement TEXT DEFAULT 'full_time',
  jobTitle TEXT,
  contractHours REAL DEFAULT 8,
  wageSettingsJson TEXT,
  employmentInfoJson TEXT,
  studentDataJson TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS work_shifts (
  id TEXT PRIMARY KEY,
  calendarId TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('WORK', 'REPO', 'ARGIA', 'ADEIA', 'SICK', 'EMPTY')),
  startTime TEXT,
  endTime TEXT,
  isOvernight BOOLEAN DEFAULT 0,
  extraHours REAL DEFAULT 0,
  notes TEXT,
  customHolidayName TEXT,
  workArrangement TEXT,
  isRemote BOOLEAN DEFAULT 0,
  isOnCall BOOLEAN DEFAULT 0,
  secondSlotJson TEXT,
  FOREIGN KEY(calendarId) REFERENCES calendars(id) ON DELETE CASCADE,
  UNIQUE(calendarId, date)
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  calendarId TEXT NOT NULL,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  startTime TEXT,
  endTime TEXT,
  isAllDay BOOLEAN DEFAULT 0,
  location TEXT,
  notes TEXT,
  category TEXT DEFAULT 'general',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(calendarId) REFERENCES calendars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT,
  tag TEXT,
  date TEXT NOT NULL,
  authorUserId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared_family_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  startTime TEXT,
  endTime TEXT,
  location TEXT,
  notes TEXT,
  assignedMemberIdsJson TEXT,
  category TEXT DEFAULT 'event',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS greek_holidays (
  date TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  isBankingHoliday BOOLEAN DEFAULT 0,
  isCustom BOOLEAN DEFAULT 0
);
`);

// Auto-seed Greek Holidays if empty
const holidayCount = (db.query('SELECT COUNT(*) as c FROM greek_holidays').get() as any)?.c || 0;
if (holidayCount === 0) {
  const defaultHols = [
    { date: '2026-01-01', name: 'Πρωτοχρονιά', isBankingHoliday: 0 },
    { date: '2026-01-06', name: 'Θεοφάνεια', isBankingHoliday: 0 },
    { date: '2026-02-23', name: 'Καθαρά Δευτέρα', isBankingHoliday: 0 },
    { date: '2026-03-25', name: 'Ευαγγελισμός / 25η Μαρτίου', isBankingHoliday: 0 },
    { date: '2026-04-10', name: 'Μεγάλη Παρασκευή', isBankingHoliday: 0 },
    { date: '2026-04-11', name: 'Μεγάλο Σάββατο', isBankingHoliday: 1 },
    { date: '2026-04-12', name: 'Κυριακή του Πάσχα', isBankingHoliday: 0 },
    { date: '2026-04-13', name: 'Δευτέρα του Πάσχα', isBankingHoliday: 0 },
    { date: '2026-05-01', name: 'Εργατική Πρωτομαγιά', isBankingHoliday: 0 },
    { date: '2026-06-01', name: 'Αγίου Πνεύματος', isBankingHoliday: 1 },
    { date: '2026-08-15', name: 'Κοίμηση της Θεοτόκου', isBankingHoliday: 0 },
    { date: '2026-10-28', name: '28η Οκτωβρίου', isBankingHoliday: 0 },
    { date: '2026-12-25', name: 'Χριστούγεννα', isBankingHoliday: 0 },
    { date: '2026-12-26', name: 'Σύναξη της Θεοτόκου', isBankingHoliday: 0 },
  ];
  const insertHol = db.prepare('INSERT OR IGNORE INTO greek_holidays (date, name, isBankingHoliday, isCustom) VALUES (?, ?, ?, 0)');
  for (const h of defaultHols) {
    insertHol.run(h.date, h.name, h.isBankingHoliday);
  }
}

// Simple hash helper
function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex');
}

function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Auth Middleware (extracts Bearer token or cookie)
function getAuthUser(req: Request): any | null {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  const session = db.query('SELECT * FROM sessions WHERE token = ? AND expiresAt > datetime("now")').get(token) as any;
  if (!session) return null;

  const user = db.query('SELECT id, username, displayName, role, avatar, color, (pinHash IS NOT NULL AND pinHash != "") as hasPin, createdAt FROM users WHERE id = ?').get(session.userId);
  return user || null;
}

// ----------------- SYSTEM & ONBOARDING ENDPOINTS -----------------
app.get('/api/system/status', (req: Request, res: Response) => {
  try {
    const userCountRow = db.query('SELECT COUNT(*) as count FROM users').get() as any;
    const userCount = userCountRow?.count || 0;
    const familyNameRow = db.query('SELECT value FROM system_settings WHERE key = "familyName"').get() as any;
    const familyName = familyNameRow?.value || 'Οικογένεια';
    
    return res.json({
      onboardingCompleted: userCount > 0,
      familyName,
      userCount,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/system/setup', (req: Request, res: Response) => {
  try {
    const existingCount = (db.query('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
    if (existingCount > 0) {
      return res.status(400).json({ error: 'System has already been initialized' });
    }

    const { familyName, adminName, adminUsername, adminPin } = req.body;
    if (!adminName || !adminUsername) {
      return res.status(400).json({ error: 'Admin name and username are required' });
    }

    const cleanFamilyName = familyName?.trim() || 'Οικογένεια';
    db.run('INSERT OR REPLACE INTO system_settings (key, value) VALUES ("familyName", ?)', [cleanFamilyName]);

    const adminId = generateId('user');
    const pinHash = adminPin ? hashPin(adminPin) : null;

    db.run(
      'INSERT INTO users (id, username, displayName, role, pinHash, avatar, color) VALUES (?, ?, ?, "parent", ?, "👨‍💼", "#3b82f6")',
      [adminId, adminUsername.trim().toLowerCase(), adminName.trim(), pinHash]
    );

    // Create an initial default calendar for the admin
    const calId = generateId('cal');
    db.run(
      'INSERT INTO calendars (id, userId, name, type, color, isSharedWithFamily, workArrangement) VALUES (?, ?, "Πρόγραμμα Εργασίας", "WORK_SHIFTS", "#3b82f6", 1, "full_time")',
      [calId, adminId]
    );

    // Create a login token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.run('INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)', [token, adminId, expiresAt]);

    const user = db.query('SELECT id, username, displayName, role, avatar, color, (pinHash IS NOT NULL AND pinHash != "") as hasPin, createdAt FROM users WHERE id = ?').get(adminId);

    return res.json({
      success: true,
      token,
      user,
      familyName: cleanFamilyName,
    });
  } catch (err: any) {
    console.error('Setup error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----------------- AUTH ENDPOINTS -----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, pin } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const user = db.query('SELECT * FROM users WHERE LOWER(username) = ?').get(username.trim().toLowerCase()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Ο χρήστης δεν βρέθηκε' });
    }

    if (user.pinHash) {
      if (!pin || hashPin(pin) !== user.pinHash) {
        return res.status(401).json({ error: 'Λανθασμένο PIN / Κωδικός πρόσβασης' });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.run('INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)', [token, user.id, expiresAt]);

    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      avatar: user.avatar,
      color: user.color,
      hasPin: Boolean(user.pinHash),
      createdAt: user.createdAt,
    };

    return res.json({ token, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Quick Switch (by userId, verifying PIN if set)
app.post('/api/auth/quick-switch', (req: Request, res: Response) => {
  try {
    const { userId, pin } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = db.query('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.pinHash) {
      if (!pin || hashPin(pin) !== user.pinHash) {
        return res.status(401).json({ error: 'Λανθασμένο PIN' });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.run('INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)', [token, user.id, expiresAt]);

    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      avatar: user.avatar,
      color: user.color,
      hasPin: Boolean(user.pinHash),
      createdAt: user.createdAt,
    };

    return res.json({ token, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  return res.json({ user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    db.run('DELETE FROM sessions WHERE token = ?', [token]);
  }
  return res.json({ success: true });
});

// ----------------- USERS CRUD -----------------
app.get('/api/users', (req: Request, res: Response) => {
  try {
    const users = db.query(
      'SELECT id, username, displayName, role, avatar, color, (pinHash IS NOT NULL AND pinHash != "") as hasPin, createdAt FROM users ORDER BY createdAt ASC'
    ).all();
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', (req: Request, res: Response) => {
  try {
    const currentUser = getAuthUser(req);
    // Allow if first user or parent role
    const totalUsers = (db.query('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
    if (totalUsers > 0 && currentUser?.role !== 'parent') {
      return res.status(403).json({ error: 'Μόνο ο γονέας/διαχειριστής μπορεί να προσθέσει μέλη' });
    }

    const { username, displayName, role, pin, avatar, color } = req.body;
    if (!username || !displayName) {
      return res.status(400).json({ error: 'Username and display name are required' });
    }

    const id = generateId('user');
    const pinHash = pin ? hashPin(pin) : null;
    const userRole = role === 'child' ? 'child' : 'parent';
    const userAvatar = avatar || (userRole === 'parent' ? '👨‍💼' : '🎒');
    const userColor = color || (userRole === 'parent' ? '#0ea5e9' : '#10b981');

    db.run(
      'INSERT INTO users (id, username, displayName, role, pinHash, avatar, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username.trim().toLowerCase(), displayName.trim(), userRole, pinHash, userAvatar, userColor]
    );

    // Auto-create initial calendar based on role
    const calId = generateId('cal');
    const calType = userRole === 'parent' ? 'WORK_SHIFTS' : 'STUDENT_SCHEDULE';
    const calName = userRole === 'parent' ? 'Πρόγραμμα Εργασίας' : 'Σχολείο & Δραστηριότητες';

    db.run(
      'INSERT INTO calendars (id, userId, name, type, color, isSharedWithFamily, workArrangement) VALUES (?, ?, ?, ?, ?, 1, ?)',
      [calId, id, calName, calType, userColor, userRole === 'parent' ? 'full_time' : null]
    );

    const created = db.query(
      'SELECT id, username, displayName, role, avatar, color, (pinHash IS NOT NULL AND pinHash != "") as hasPin, createdAt FROM users WHERE id = ?'
    ).get(id);

    return res.json(created);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Το όνομα χρήστη (username) χρησιμοποιείται ήδη' });
    }
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  try {
    const currentUser = getAuthUser(req);
    const { id } = req.params;
    if (currentUser?.id !== id && currentUser?.role !== 'parent') {
      return res.status(403).json({ error: 'Δεν επιτρέπεται η επεξεργασία άλλου χρήστη' });
    }

    const { displayName, role, pin, avatar, color } = req.body;
    const existing = db.query('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'User not found' });

    let pinHash = existing.pinHash;
    if (pin !== undefined) {
      pinHash = pin ? hashPin(pin) : null;
    }

    const updatedRole = (currentUser?.role === 'parent' && role) ? role : existing.role;
    const updatedName = displayName ? displayName.trim() : existing.displayName;
    const updatedAvatar = avatar || existing.avatar;
    const updatedColor = color || existing.color;

    db.run(
      'UPDATE users SET displayName = ?, role = ?, pinHash = ?, avatar = ?, color = ? WHERE id = ?',
      [updatedName, updatedRole, pinHash, updatedAvatar, updatedColor, id]
    );

    const safe = db.query(
      'SELECT id, username, displayName, role, avatar, color, (pinHash IS NOT NULL AND pinHash != "") as hasPin, createdAt FROM users WHERE id = ?'
    ).get(id);

    return res.json(safe);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  try {
    const currentUser = getAuthUser(req);
    if (currentUser?.role !== 'parent') {
      return res.status(403).json({ error: 'Μόνο ο διαχειριστής/γονέας μπορεί να διαγράψει μέλη' });
    }

    const { id } = req.params;
    if (currentUser.id === id) {
      return res.status(400).json({ error: 'Δεν μπορείτε να διαγράψετε τον εαυτό σας' });
    }

    db.run('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------- CALENDARS CRUD -----------------
app.get('/api/calendars', (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM calendars';
    let params: any[] = [];

    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    query += ' ORDER BY createdAt ASC';

    const rows = db.query(query).all(...params) as any[];
    const calendars = rows.map((r) => ({
      ...r,
      isSharedWithFamily: Boolean(r.isSharedWithFamily),
      wageSettings: r.wageSettingsJson ? JSON.parse(r.wageSettingsJson) : undefined,
      employmentInfo: r.employmentInfoJson ? JSON.parse(r.employmentInfoJson) : undefined,
      studentData: r.studentDataJson ? JSON.parse(r.studentDataJson) : undefined,
    }));

    return res.json(calendars);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/calendars', (req: Request, res: Response) => {
  try {
    const currentUser = getAuthUser(req);
    const { userId, name, type, color, isSharedWithFamily, workArrangement, jobTitle, contractHours, wageSettings, employmentInfo, studentData } = req.body;
    
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId || !name || !type) {
      return res.status(400).json({ error: 'userId, name, and type are required' });
    }

    const id = generateId('cal');
    const wageSettingsJson = wageSettings ? JSON.stringify(wageSettings) : null;
    const employmentInfoJson = employmentInfo ? JSON.stringify(employmentInfo) : null;
    const studentDataJson = studentData ? JSON.stringify(studentData) : null;

    db.run(
      `INSERT INTO calendars (id, userId, name, type, color, isSharedWithFamily, workArrangement, jobTitle, contractHours, wageSettingsJson, employmentInfoJson, studentDataJson)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        targetUserId,
        name.trim(),
        type,
        color || '#0ea5e9',
        isSharedWithFamily !== false ? 1 : 0,
        workArrangement || 'full_time',
        jobTitle || null,
        contractHours || 8,
        wageSettingsJson,
        employmentInfoJson,
        studentDataJson,
      ]
    );

    const created = db.query('SELECT * FROM calendars WHERE id = ?').get(id) as any;
    created.isSharedWithFamily = Boolean(created.isSharedWithFamily);
    if (created.wageSettingsJson) created.wageSettings = JSON.parse(created.wageSettingsJson);
    if (created.employmentInfoJson) created.employmentInfo = JSON.parse(created.employmentInfoJson);
    if (created.studentDataJson) created.studentData = JSON.parse(created.studentDataJson);

    return res.json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/calendars/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, isSharedWithFamily, workArrangement, jobTitle, contractHours, wageSettings, employmentInfo, studentData } = req.body;

    const existing = db.query('SELECT * FROM calendars WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'Calendar not found' });

    const wageSettingsJson = wageSettings !== undefined ? JSON.stringify(wageSettings) : existing.wageSettingsJson;
    const employmentInfoJson = employmentInfo !== undefined ? JSON.stringify(employmentInfo) : existing.employmentInfoJson;
    const studentDataJson = studentData !== undefined ? JSON.stringify(studentData) : existing.studentDataJson;

    db.run(
      `UPDATE calendars SET
        name = ?, color = ?, isSharedWithFamily = ?, workArrangement = ?,
        jobTitle = ?, contractHours = ?, wageSettingsJson = ?, employmentInfoJson = ?, studentDataJson = ?
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        color !== undefined ? color : existing.color,
        isSharedWithFamily !== undefined ? (isSharedWithFamily ? 1 : 0) : existing.isSharedWithFamily,
        workArrangement !== undefined ? workArrangement : existing.workArrangement,
        jobTitle !== undefined ? jobTitle : existing.jobTitle,
        contractHours !== undefined ? contractHours : existing.contractHours,
        wageSettingsJson,
        employmentInfoJson,
        studentDataJson,
        id,
      ]
    );

    const updated = db.query('SELECT * FROM calendars WHERE id = ?').get(id) as any;
    updated.isSharedWithFamily = Boolean(updated.isSharedWithFamily);
    if (updated.wageSettingsJson) updated.wageSettings = JSON.parse(updated.wageSettingsJson);
    if (updated.employmentInfoJson) updated.employmentInfo = JSON.parse(updated.employmentInfoJson);
    if (updated.studentDataJson) updated.studentData = JSON.parse(updated.studentDataJson);

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/calendars/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM calendars WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------- WORK SHIFTS CRUD -----------------
app.get('/api/calendars/:id/shifts', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rows = db.query('SELECT * FROM work_shifts WHERE calendarId = ?').all(id) as any[];
    const shiftsRecord: Record<string, any> = {};

    for (const r of rows) {
      shiftsRecord[r.date] = {
        date: r.date,
        type: r.type,
        startTime: r.startTime,
        endTime: r.endTime,
        isOvernight: Boolean(r.isOvernight),
        extraHours: r.extraHours,
        notes: r.notes || '',
        customHolidayName: r.customHolidayName || '',
        workArrangement: r.workArrangement,
        isRemote: Boolean(r.isRemote),
        isOnCall: Boolean(r.isOnCall),
        secondSlot: r.secondSlotJson ? JSON.parse(r.secondSlotJson) : undefined,
      };
    }

    return res.json(shiftsRecord);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/calendars/:id/shifts', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shift = req.body;
    if (!shift || !shift.date || !shift.type) {
      return res.status(400).json({ error: 'date and type are required' });
    }

    if (shift.type === 'EMPTY') {
      db.run('DELETE FROM work_shifts WHERE calendarId = ? AND date = ?', [id, shift.date]);
      return res.json({ success: true, deleted: true });
    }

    const shiftId = generateId('shift');
    const secondSlotJson = shift.secondSlot ? JSON.stringify(shift.secondSlot) : null;

    db.run(
      `INSERT INTO work_shifts (id, calendarId, date, type, startTime, endTime, isOvernight, extraHours, notes, customHolidayName, workArrangement, isRemote, isOnCall, secondSlotJson)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(calendarId, date) DO UPDATE SET
         type = excluded.type,
         startTime = excluded.startTime,
         endTime = excluded.endTime,
         isOvernight = excluded.isOvernight,
         extraHours = excluded.extraHours,
         notes = excluded.notes,
         customHolidayName = excluded.customHolidayName,
         workArrangement = excluded.workArrangement,
         isRemote = excluded.isRemote,
         isOnCall = excluded.isOnCall,
         secondSlotJson = excluded.secondSlotJson`,
      [
        shiftId,
        id,
        shift.date,
        shift.type,
        shift.startTime || null,
        shift.endTime || null,
        shift.isOvernight ? 1 : 0,
        shift.extraHours || 0,
        shift.notes || null,
        shift.customHolidayName || null,
        shift.workArrangement || null,
        shift.isRemote ? 1 : 0,
        shift.isOnCall ? 1 : 0,
        secondSlotJson,
      ]
    );

    return res.json({ success: true, shift });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/calendars/:id/shifts/:date', (req: Request, res: Response) => {
  try {
    const { id, date } = req.params;
    db.run('DELETE FROM work_shifts WHERE calendarId = ? AND date = ?', [id, date]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------- GENERIC CALENDAR EVENTS CRUD -----------------
app.get('/api/calendars/:id/events', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const events = db.query('SELECT * FROM calendar_events WHERE calendarId = ? ORDER BY date ASC, startTime ASC').all(id) as any[];
    return res.json(events.map((e) => ({ ...e, isAllDay: Boolean(e.isAllDay) })));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/calendars/:id/events', (req: Request, res: Response) => {
  try {
    const currentUser = getAuthUser(req);
    const { id } = req.params;
    const event = req.body;
    if (!event || !event.title || !event.date) {
      return res.status(400).json({ error: 'title and date are required' });
    }

    const eventId = event.id || generateId('evt');
    db.run(
      `INSERT INTO calendar_events (id, calendarId, userId, title, date, startTime, endTime, isAllDay, location, notes, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         date = excluded.date,
         startTime = excluded.startTime,
         endTime = excluded.endTime,
         isAllDay = excluded.isAllDay,
         location = excluded.location,
         notes = excluded.notes,
         category = excluded.category`,
      [
        eventId,
        id,
        currentUser?.id || event.userId || 'system',
        event.title.trim(),
        event.date,
        event.startTime || null,
        event.endTime || null,
        event.isAllDay ? 1 : 0,
        event.location || null,
        event.notes || null,
        event.category || 'general',
      ]
    );

    const saved = db.query('SELECT * FROM calendar_events WHERE id = ?').get(eventId) as any;
    saved.isAllDay = Boolean(saved.isAllDay);
    return res.json(saved);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/calendars/:id/events/:eventId', (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    db.run('DELETE FROM calendar_events WHERE id = ?', [eventId]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------- CONSOLIDATED MASTER FAMILY VIEW -----------------
app.get('/api/family/master', (req: Request, res: Response) => {
  try {
    const familyNameRow = db.query('SELECT value FROM system_settings WHERE key = "familyName"').get() as any;
    const familyName = familyNameRow?.value || 'Οικογένεια';

    const users = db.query('SELECT id, username, displayName, role, avatar, color, createdAt FROM users ORDER BY createdAt ASC').all() as any[];
    const calendars = db.query('SELECT * FROM calendars ORDER BY createdAt ASC').all() as any[];
    const allShifts = db.query('SELECT * FROM work_shifts').all() as any[];
    const allEvents = db.query('SELECT * FROM calendar_events').all() as any[];
    const holidays = db.query('SELECT * FROM greek_holidays').all() as any[];
    const familyNotes = db.query('SELECT * FROM family_notes ORDER BY createdAt DESC').all() as any[];
    const sharedEvents = db.query('SELECT * FROM shared_family_events ORDER BY date ASC').all() as any[];

    // Structure members and their calendars
    const members = users.map((u) => {
      const userCals = calendars.filter((c) => c.userId === u.id);
      const primaryWorkCal = userCals.find((c) => c.type === 'WORK_SHIFTS');
      const primaryStudentCal = userCals.find((c) => c.type === 'STUDENT_SCHEDULE');

      // Aggregate shifts for worker member compatibility
      const memberShifts: Record<string, any> = {};
      if (primaryWorkCal) {
        const calShifts = allShifts.filter((s) => s.calendarId === primaryWorkCal.id);
        for (const s of calShifts) {
          memberShifts[s.date] = {
            date: s.date,
            type: s.type,
            startTime: s.startTime,
            endTime: s.endTime,
            isOvernight: Boolean(s.isOvernight),
            extraHours: s.extraHours,
            notes: s.notes || '',
            customHolidayName: s.customHolidayName || '',
            workArrangement: s.workArrangement || primaryWorkCal.workArrangement,
            isRemote: Boolean(s.isRemote),
            isOnCall: Boolean(s.isOnCall),
            secondSlot: s.secondSlotJson ? JSON.parse(s.secondSlotJson) : undefined,
          };
        }
      }

      const wageSettings = primaryWorkCal?.wageSettingsJson ? JSON.parse(primaryWorkCal.wageSettingsJson) : undefined;
      const employmentInfo = primaryWorkCal?.employmentInfoJson ? JSON.parse(primaryWorkCal.employmentInfoJson) : undefined;
      const studentData = primaryStudentCal?.studentDataJson ? JSON.parse(primaryStudentCal.studentDataJson) : undefined;

      return {
        id: u.id,
        name: u.displayName,
        username: u.username,
        role: (u.role === 'child' || primaryStudentCal) ? 'student' : 'worker',
        userRole: u.role, // 'parent' or 'child'
        avatar: u.avatar || '👤',
        color: u.color || '#3b82f6',
        calendars: userCals.map((c) => ({
          ...c,
          isSharedWithFamily: Boolean(c.isSharedWithFamily),
        })),
        workerData: primaryWorkCal ? {
          jobTitle: primaryWorkCal.jobTitle || 'Εργασία',
          workArrangement: primaryWorkCal.workArrangement || 'full_time',
          contractHours: primaryWorkCal.contractHours || 8,
          shifts: memberShifts,
          wageSettings,
          employmentInfo,
        } : undefined,
        studentData,
      };
    });

    return res.json({
      householdName: familyName,
      members,
      holidays: holidays.map((h) => ({ ...h, isBankingHoliday: Boolean(h.isBankingHoliday), isCustom: Boolean(h.isCustom) })),
      familyNotes,
      sharedEvents: sharedEvents.map((e) => ({
        ...e,
        assignedMemberIds: e.assignedMemberIdsJson ? JSON.parse(e.assignedMemberIdsJson) : [],
      })),
      allCalendarEvents: allEvents.map((e) => ({ ...e, isAllDay: Boolean(e.isAllDay) })),
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error fetching master family view:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----------------- FAMILY NOTES CRUD -----------------
app.get('/api/family/notes', (req: Request, res: Response) => {
  try {
    const notes = db.query('SELECT * FROM family_notes ORDER BY createdAt DESC').all();
    return res.json(notes);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/family/notes', (req: Request, res: Response) => {
  try {
    const currentUser = getAuthUser(req);
    const { title, text, tag, date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const id = generateId('note');
    const noteDate = date || new Date().toISOString().split('T')[0];

    db.run(
      'INSERT INTO family_notes (id, title, text, tag, date, authorUserId) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title.trim(), text || '', tag || 'Σπίτι', noteDate, currentUser?.id || null]
    );

    const saved = db.query('SELECT * FROM family_notes WHERE id = ?').get(id);
    return res.json(saved);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/family/notes/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM family_notes WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------- STATIC ASSETS & SPA SERVING -----------------
const PUBLIC_DIR = path.resolve(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
}

const DIST_DIR = path.resolve(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Family Schedule] Clean SQLite-powered server running on http://0.0.0.0:${PORT}`);
});
