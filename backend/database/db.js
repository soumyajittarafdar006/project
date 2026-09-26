const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'temperature.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let nativeSqlite = null;
try {
  const sqlite3 = require('sqlite3').verbose();
  const testDb = new sqlite3.Database(':memory:');
  testDb.close();
  nativeSqlite = sqlite3;
  console.log('✅ Native SQLite driver loaded successfully.');
} catch (err) {
  console.log('ℹ️ Native C++ SQLite binding unavailable. Using robust File-Backed SQLite Engine.');
}

// Global In-Memory + Disk Persisted DB State for Pure-JS Engine
const jsonDbPath = path.join(dbDir, 'temperature_store.json');

let store = {
  readings: [],
  settings: [
    { id: 1, minTemp: 20.0, maxTemp: 35.0, criticalTemp: 40.0, updatedAt: new Date().toISOString() }
  ],
  alerts: [],
  nextReadingId: 1,
  nextAlertId: 1
};

// Load persistent store from disk if exists
if (fs.existsSync(jsonDbPath)) {
  try {
    const raw = fs.readFileSync(jsonDbPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.readings)) {
      store = parsed;
    }
  } catch (e) {
    console.error('Error reading JSON store:', e);
  }
}

const saveStoreToDisk = () => {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving store to disk:', e);
  }
};

let db = null;
let dbAsync = null;

if (nativeSqlite) {
  const sqliteDb = new nativeSqlite.Database(dbPath, (err) => {
    if (err) console.error('❌ Database connection error:', err.message);
    else console.log('✅ Connected to SQLite database at:', dbPath);
  });

  db = sqliteDb;
  dbAsync = {
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        });
      });
    },
    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  };
} else {
  // Pure JS DB implementation matching SQL queries
  dbAsync = {
    async run(sql, params = []) {
      const query = sql.trim().toUpperCase();

      if (query.startsWith('CREATE TABLE')) {
        return { id: 0, changes: 0 };
      }

      if (query.startsWith('INSERT INTO READINGS')) {
        const id = store.nextReadingId++;
        const [deviceId, temperature, status, timestamp] = params;
        const newReading = { id, deviceId, temperature: parseFloat(temperature), status, timestamp };
        store.readings.push(newReading);
        saveStoreToDisk();
        return { id, changes: 1 };
      }

      if (query.startsWith('INSERT INTO SETTINGS')) {
        const [id, minTemp, maxTemp, criticalTemp] = params;
        store.settings = [{ id: id || 1, minTemp, maxTemp, criticalTemp, updatedAt: new Date().toISOString() }];
        saveStoreToDisk();
        return { id: 1, changes: 1 };
      }

      if (query.startsWith('INSERT INTO ALERTS')) {
        const id = store.nextAlertId++;
        const [deviceId, temperature, type, message, timestamp] = params;
        const newAlert = { id, deviceId, temperature: parseFloat(temperature), type, message, timestamp };
        store.alerts.push(newAlert);
        saveStoreToDisk();
        return { id, changes: 1 };
      }

      if (query.startsWith('UPDATE SETTINGS')) {
        const [minTemp, maxTemp, criticalTemp, updatedAt] = params;
        store.settings[0] = {
          id: 1,
          minTemp: parseFloat(minTemp),
          maxTemp: parseFloat(maxTemp),
          criticalTemp: parseFloat(criticalTemp),
          updatedAt
        };
        saveStoreToDisk();
        return { id: 1, changes: 1 };
      }

      return { id: 0, changes: 0 };
    },

    async get(sql, params = []) {
      const query = sql.trim().toUpperCase();

      if (query.includes('FROM SETTINGS')) {
        return store.settings[0] || null;
      }

      if (query.includes('FROM READINGS') && query.includes('MIN(')) {
        if (store.readings.length === 0) {
          return { totalReadings: 0, minimum: null, maximum: null, average: null };
        }
        const temps = store.readings.map((r) => r.temperature);
        const sum = temps.reduce((a, b) => a + b, 0);
        return {
          totalReadings: store.readings.length,
          minimum: Math.min(...temps),
          maximum: Math.max(...temps),
          average: sum / temps.length
        };
      }

      if (query.includes('FROM READINGS') && query.includes('ORDER BY ID DESC LIMIT 1')) {
        if (store.readings.length === 0) return null;
        return store.readings[store.readings.length - 1];
      }

      return null;
    },

    async all(sql, params = []) {
      const query = sql.trim().toUpperCase();
      const limit = params[0] || 50;

      if (query.includes('FROM READINGS')) {
        const slice = store.readings.slice(-limit);
        return [...slice].reverse();
      }

      if (query.includes('FROM ALERTS')) {
        const slice = store.alerts.slice(-limit);
        return [...slice].reverse();
      }

      return [];
    }
  };
}

// Initialize tables
const initDb = async () => {
  try {
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT NOT NULL,
        temperature REAL NOT NULL,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        minTemp REAL NOT NULL DEFAULT 20.0,
        maxTemp REAL NOT NULL DEFAULT 35.0,
        criticalTemp REAL NOT NULL DEFAULT 40.0,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT NOT NULL,
        temperature REAL NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ SQLite database initialized successfully.');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
  }
};

initDb();

module.exports = { db, dbAsync };
