const db = require('./db');

const runMigrations = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      line1 TEXT NOT NULL,
      line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      country TEXT DEFAULT 'India',
      pincode TEXT NOT NULL,
      isPrimary INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(customerId) REFERENCES customers(id) ON DELETE CASCADE
    );`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_customerId ON addresses(customerId);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_city_state_pin ON addresses(city, state, pincode);`);

    // Seed minimal data
    db.run(
      `INSERT INTO customers(firstName,lastName,phone,email) VALUES
        ('John','Doe','9999999999','john@example.com'),
        ('Jane','Smith','8888888888','jane@example.com');`
    );
    db.run(
      `INSERT INTO addresses(customerId,line1,city,state,pincode,isPrimary) VALUES
        (1,'123 MG Road','Bengaluru','Karnataka','560001',1),
        (1,'45 Residency Rd','Bengaluru','Karnataka','560025',0),
        (2,'10 Park St','Mumbai','Maharashtra','400001',1);`
    );
  });
};

runMigrations();

// Close when done
setTimeout(() => db.close(), 500);


