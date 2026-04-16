const bcrypt = require('bcrypt');
const pool = require('../config/db');
const localStore = require('../config/localStore');

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error) {
    try {
      const user = await localStore.signup({ name, email, password });
      res.status(201).json({
        message: 'User created successfully (fallback mode)',
        user,
      });
    } catch (fallbackError) {
      console.error('Signup error:', fallbackError);
      res.status(500).json({
        message: 'Error creating user',
        error: fallbackError.message,
      });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: pw, ...userData } = user;
    res.json({
      message: 'Login successful',
      user: userData,
    });
  } catch (error) {
    try {
      const user = await localStore.login({ email, password });

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        message: 'Login successful (fallback mode)',
        user,
      });
    } catch (fallbackError) {
      console.error('Login error:', fallbackError);
      res.status(500).json({
        message: 'Error logging in',
        error: fallbackError.message,
      });
    }
  }
};

module.exports = {
  signup,
  login,
};
