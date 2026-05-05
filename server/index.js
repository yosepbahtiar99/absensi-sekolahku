const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const routes = require('./routes');
app.use('/api', routes);

// Error Handling Middleware
const errorMiddleware = require('./middleware/errorMiddleware');
app.use(errorMiddleware);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Absensi Sekolahku API' });
});

// Start Server
const { sequelize } = require('./models');

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
