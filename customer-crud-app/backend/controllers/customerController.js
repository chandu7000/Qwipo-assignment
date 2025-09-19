
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

exports.createCustomer = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email } = req.body;
    const result = await run(
      `INSERT INTO customers(firstName,lastName,phone,email) VALUES (?,?,?,?)`,
      [firstName, lastName, phone, email || null]
    );
    const customer = await get(`SELECT * FROM customers WHERE id = ?`, [result.id]);
    res.status(201).json({ message: 'Customer created', customer });
  } catch (err) {
    next(err);
  }
};

exports.listCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', q, city, state, pincode } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const filters = [];
    const params = [];
    if (q) {
      filters.push('(firstName LIKE ? OR lastName LIKE ? OR phone LIKE ? OR email LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (city) { filters.push('EXISTS (SELECT 1 FROM addresses a WHERE a.customerId = customers.id AND a.city LIKE ?)'); params.push(`%${city}%`); }
    if (state) { filters.push('EXISTS (SELECT 1 FROM addresses a WHERE a.customerId = customers.id AND a.state LIKE ?)'); params.push(`%${state}%`); }
    if (pincode) { filters.push('EXISTS (SELECT 1 FROM addresses a WHERE a.customerId = customers.id AND a.pincode = ?)'); params.push(pincode); }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const items = await all(
      `SELECT * FROM customers ${where} ORDER BY ${sort} ${order.toUpperCase()} LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    const totalRow = await get(`SELECT COUNT(*) as cnt FROM customers ${where}`, params);
    res.json({ items, total: totalRow.cnt, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const customer = await get(`SELECT * FROM customers WHERE id = ?`, [id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const addresses = await all(`SELECT * FROM addresses WHERE customerId = ? ORDER BY isPrimary DESC, id ASC`, [id]);
    const hasOnlyOneAddress = addresses.length === 1;
    res.json({ ...customer, addresses, hasOnlyOneAddress });
  } catch (err) {
    next(err);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await get(`SELECT * FROM customers WHERE id = ?`, [id]);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });
    const { firstName = existing.firstName, lastName = existing.lastName, phone = existing.phone, email = existing.email } = req.body;
    await run(
      `UPDATE customers SET firstName=?, lastName=?, phone=?, email=?, updatedAt=datetime('now') WHERE id=?`,
      [firstName, lastName, phone, email, id]
    );
    const updated = await get(`SELECT * FROM customers WHERE id = ?`, [id]);
    res.json({ message: 'Customer updated', customer: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await get(`SELECT * FROM customers WHERE id = ?`, [id]);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });
    await run(`DELETE FROM customers WHERE id = ?`, [id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};


