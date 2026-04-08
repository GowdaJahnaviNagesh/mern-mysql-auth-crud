// backend/controllers/itemController.js
const db = require('../config/db');

// ─── @GET /api/items ─────────────────────────────────────────

exports.getItems = async (req, res, next) => {
  try {
    const [items] = await db.query(
      'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/items/:id ─────────────────────────────────────

exports.getItem = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/items ────────────────────────────────────────

exports.createItem = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const validStatuses = ['active', 'pending', 'completed'];
    const itemStatus = validStatuses.includes(status) ? status : 'active';

    const [result] = await db.query(
      'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [req.user.id, title.trim(), description?.trim() || null, itemStatus]
    );

    const [newItem] = await db.query('SELECT * FROM items WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Item created', item: newItem[0] });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/items/:id ─────────────────────────────────────

exports.updateItem = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    // Verify ownership
    const [rows] = await db.query(
      'SELECT id FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const validStatuses = ['active', 'pending', 'completed'];
    const fields  = [];
    const values  = [];

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      fields.push('title = ?');
      values.push(title.trim());
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description?.trim() || null);
    }
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
      fields.push('status = ?');
      values.push(status);
    }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    values.push(req.params.id, req.user.id);
    await db.query(
      `UPDATE items SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    const [updated] = await db.query('SELECT * FROM items WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Item updated', item: updated[0] });
  } catch (err) {
    next(err);
  }
};

// ─── @DELETE /api/items/:id ──────────────────────────────────

exports.deleteItem = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await db.query('DELETE FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/stats ─────────────────────────────────────────

exports.getStats = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT
         COUNT(*)                                        AS total,
         SUM(status = 'active')                         AS active,
         SUM(status = 'pending')                        AS pending,
         SUM(status = 'completed')                      AS completed
       FROM items
       WHERE user_id = ?`,
      [req.user.id]
    );

    const stats = rows[0];
    res.json({
      success: true,
      stats: {
        total:     Number(stats.total)     || 0,
        active:    Number(stats.active)    || 0,
        pending:   Number(stats.pending)   || 0,
        completed: Number(stats.completed) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
