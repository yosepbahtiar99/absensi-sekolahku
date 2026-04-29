const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Gagal upload file' });
  }

  res.json({
    message: 'File berhasil diupload',
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

module.exports = router;
