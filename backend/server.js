const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Import routes
const versionRoutes = require('./routes/versionRoutes');
const releaseRoutes = require('./routes/releaseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/versions', versionRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user',userRoutes);

// Database connection close on shutdown
const pool = require('./db/pool');
process.on('SIGTERM', () => {
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Hello, this is Fiscality version management system');
});
