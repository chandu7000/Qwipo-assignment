const db = require('../db');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

exports.listAddresses = async (req, res, next) => {
  try {
    const { customerId, city, state, pincode, multipleOnly } = req.query;
    const filters = [];
    const params = [];
    if (customerId) { filters.push('a.customerId = ?'); params.push(Number(customerId)); }
    if (city) { filters.push('a.city LIKE ?'); params.push(`%${city}%`); }
    if (state) { filters.push('a.state LIKE ?'); params.push(`%${state}%`); }
    if (pincode) { filters.push('a.pincode = ?'); params.push(pincode); }
    if (multipleOnly === 'true') { filters.push('(SELECT COUNT(1) FROM addresses aa WHERE aa.customerId = a.customerId) > 1'); }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const rows = await all(`SELECT a.*, c.firstName, c.lastName FROM addresses a JOIN customers c ON c.id=a.customerId ${where} ORDER BY a.customerId, a.isPrimary DESC, a.id`, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.createAddress = async (req, res, next) => {
  try {
    const { customerId, line1, line2, city, state, country = 'India', pincode, isPrimary = false } = req.body;
    const customer = await get(`SELECT id FROM customers WHERE id=?`, [customerId]);
    if (!customer) return res.status(400).json({ message: 'Invalid customerId' });
    if (isPrimary) {
      await run(`UPDATE addresses SET isPrimary = 0 WHERE customerId = ?`, [customerId]);
    }
    const result = await run(
      `INSERT INTO addresses(customerId,line1,line2,city,state,country,pincode,isPrimary) VALUES(?,?,?,?,?,?,?,?)`,
      [customerId, line1, line2 || null, city, state, country, pincode, isPrimary ? 1 : 0]
    );
    const address = await get(`SELECT * FROM addresses WHERE id=?`, [result.id]);
    res.status(201).json({ message: 'Address created', address });
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await get(`SELECT * FROM addresses WHERE id=?`, [id]);
    if (!existing) return res.status(404).json({ message: 'Address not found' });
    const { line1 = existing.line1, line2 = existing.line2, city = existing.city, state = existing.state, country = existing.country, pincode = existing.pincode, isPrimary = !!existing.isPrimary } = req.body;
    if (isPrimary) {
      await run(`UPDATE addresses SET isPrimary = 0 WHERE customerId = ?`, [existing.customerId]);
    }
    await run(
      `UPDATE addresses SET line1=?, line2=?, city=?, state=?, country=?, pincode=?, isPrimary=?, updatedAt=datetime('now') WHERE id=?`,
      [line1, line2, city, state, country, pincode, isPrimary ? 1 : 0, id]
    );
    const updated = await get(`SELECT * FROM addresses WHERE id=?`, [id]);
    res.json({ message: 'Address updated', address: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await get(`SELECT * FROM addresses WHERE id=?`, [id]);
    if (!existing) return res.status(404).json({ message: 'Address not found' });
    await run(`DELETE FROM addresses WHERE id=?`, [id]);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};


