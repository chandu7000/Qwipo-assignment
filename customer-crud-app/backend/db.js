const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to SQLite DB', err);
  } else {
    // eslint-disable-next-line no-console
    console.log('Connected to SQLite at', DB_PATH);
  }
});

module.exports = db;


