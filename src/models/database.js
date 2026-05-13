const { Pool } = require('pg');
const axios = require('axios');
const config = require('../config/config');

const pool = new Pool(config.db);

async function initDB() {
    let connected = false;
    while (!connected) {
        try {
            const client = await pool.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS logs (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    sender TEXT NOT NULL,
                    sender_name TEXT,
                    message TEXT,
                    classification TEXT NOT NULL,
                    reason TEXT,
                    platform TEXT DEFAULT 'WHATSAPP'
                );
            `);
            client.release();
            console.log('[DB] Database initialized successfully.');
            connected = true;
        } catch (err) {
            console.error('[DB] Database not ready, retrying in 2 seconds...', err.message);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

async function saveLog(data) {
    const { sender, sender_name, message, classification, reason } = data;
    try {
        await pool.query(
            'INSERT INTO logs (sender, sender_name, message, classification, reason) VALUES ($1, $2, $3, $4, $5)',
            [sender, sender_name, message, classification, reason]
        );
        
        // Notify dashboard for real-time update
        axios.post(`${config.server.dashboardUrl}/api/internal/notify`, {
            ...data,
            timestamp: new Date().toISOString()
        }, {
            headers: { 'x-api-key': config.security.internalApiKey }
        }).catch(() => { /* Ignore if dashboard is down */ });

    } catch (err) {
        console.error('[DB] Error saving log:', err.message);
    }
}

module.exports = { pool, initDB, saveLog };
