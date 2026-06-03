const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Access Token (Short-lived)
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Refresh Token (Long-lived)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Simpen Refresh Token di Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Atau 'none' kalau beda domain + secure: true
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
    });

    res.json({
      message: 'Login berhasil',
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        photoId: user.photoId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saat login' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const refreshToken = cookies.refreshToken;

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden: Invalid refresh token' });

      const user = await User.findByPk(decoded.id);
      if (!user) return res.status(401).json({ message: 'User not found' });

      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token: accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saat refresh token' });
  }
};

const logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(204); // No content

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logout berhasil' });
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password lama salah' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saat mengubah password' });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Delete old photo if exists to prevent storage bloat
    if (user.photoId) {
      const oldPhotoPath = path.join(__dirname, '../uploads/profiles', user.photoId);
      if (fs.existsSync(oldPhotoPath)) {
        try {
          fs.unlinkSync(oldPhotoPath);
        } catch (err) {
          console.error('Gagal menghapus foto lama:', err);
        }
      }
    }
    
    user.photoId = req.file.filename;
    await user.save();

    res.json({ 
      message: 'Foto profil berhasil diunggah',
      photoId: user.photoId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saat mengunggah foto' });
  }
};

module.exports = { login, refreshToken, logout, changePassword, uploadPhoto };
