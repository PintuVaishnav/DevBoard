import express from 'express';
import { pool } from '../../db';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  try {
    // 1. Check if user already exists
    const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate user data
    const id = nanoid();
    const profileImageUrl = `https://i.pravatar.cc/150?u=${email}`;
    const role = 'user';

    // 4. Insert new user
    await pool.query(
      `INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [id, email, first_name, last_name, profileImageUrl, role]
    );

    // 5. Success response
    res.status(201).json({ message: 'User registered successfully', id });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
