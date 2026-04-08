// backend/controllers/authController.js
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const crypto      = require('crypto');
const nodemailer  = require('nodemailer');
const db          = require('../config/db');

// ─── Helpers ────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ─── @POST /api/auth/register ────────────────────────────────

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check existing email
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), phone || null, hashed]
    );

    const token = generateToken(result.insertId);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id:    result.insertId,
        name:  name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/login ───────────────────────────────────

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, phone, password, created_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:         user.id,
        name:       user.name,
        email:      user.email,
        phone:      user.phone,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/auth/me ───────────────────────────────────────

exports.getMe = async (req, res, next) => {
  try {
    // req.user is already set by protect middleware
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/forgot-password ────────────────────────

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const [rows] = await db.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    // Always return success to prevent email enumeration
    if (!rows.length) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const user = rows[0];

    // Generate random reset token
    const resetToken  = crypto.randomBytes(32).toString('hex');
    // Format expiry as MySQL-compatible local datetime (1 hour from now)
    const expiryDate  = new Date(Date.now() + 60 * 60 * 1000);
    const tokenExpiry = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to:      user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#4F46E5">Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">Reset Password</a>
          <p style="color:#666;font-size:14px">If you didn't request this, please ignore this email.</p>
          <p style="color:#aaa;font-size:12px">Link: ${resetUrl}</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/reset-password ─────────────────────────

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const [rows] = await db.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > UTC_TIMESTAMP()',
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashed, rows[0].id]
    );

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};