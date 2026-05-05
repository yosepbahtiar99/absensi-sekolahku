const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ada' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid atau expired' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses khusus Admin' });
  }
  next();
};

const isGuru = (req, res, next) => {
  if (req.user.role !== 'guru') {
    return res.status(403).json({ message: 'Akses khusus Guru' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isGuru };
