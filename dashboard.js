const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { pool, initDB } = require('./database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Internal Notification from Bot Engine
app.post('/api/internal/notify', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const logData = req.body;
    io.emit('new-log', logData); // Push to all dashboard clients
    res.sendStatus(200);
});

// API: Get Summary Statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE classification = 'SAFE') as safe,
                COUNT(*) FILTER (WHERE classification = 'JOKI') as joki,
                COUNT(*) FILTER (WHERE classification = 'SKIP') as skip
            FROM logs
        `);
        res.json(stats.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Get Recent Logs
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await pool.query(`
            SELECT * FROM logs 
            ORDER BY timestamp DESC 
            LIMIT 50
        `);
        res.json(logs.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Get Analytics Data (Hourly)
app.get('/api/analytics', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                TO_CHAR(timestamp, 'HH24:00') as hour,
                COUNT(*) FILTER (WHERE classification = 'SAFE') as safe,
                COUNT(*) FILTER (WHERE classification = 'JOKI') as joki
            FROM logs
            WHERE timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY hour
            ORDER BY hour
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
initDB().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n===================================================`);
        console.log(`🚀 Real-time Dashboard at http://localhost:${PORT}`);
        console.log(`===================================================\n`);
    });
});
