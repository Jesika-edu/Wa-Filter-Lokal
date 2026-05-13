const express = require('express');
const { pool } = require('../models/database');
const config = require('../config/config');

function initAPI(app, io) {
    // API: Internal Notification from Bot Engine
    app.post('/api/internal/notify', (req, res) => {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== config.security.internalApiKey) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        io.emit('new-log', req.body);
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

    // API: Get Analytics Data
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
}

module.exports = { initAPI };
