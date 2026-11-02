const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mini_crm_super_secret_jwt_key_2026_xyz';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@crm.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.'
    });
  }

  // Validate admin credentials
  if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password. Default is admin@crm.com / admin123'
    });
  }

  // Generate JWT token (valid for 24 hours)
  const token = jwt.sign(
    { email: ADMIN_EMAIL, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Admin authentication successful',
    token,
    user: {
      email: ADMIN_EMAIL,
      role: 'admin',
      name: 'CRM Administrator'
    }
  });
};

exports.getMe = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};
