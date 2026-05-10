const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    // Jika dijalankan di luar Docker, gunakan localhost jika DB_HOST=db gagal
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'rahasia',
    database: process.env.DB_NAME || 'wa_filter',
    port: 5432,
});

async function initDB() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sender TEXT NOT NULL,
                sender_name TEXT,
                message TEXT,
                classification TEXT NOT NULL, -- SAFE, JOKI, SKIP
                reason TEXT,
                platform TEXT DEFAULT 'WHATSAPP'
            );
        `);
        console.log('[DB] Database initialized successfully.');
    } catch (err) {
        console.error('[DB] Error initializing database:', err.message);
    } finally {
        client.release();
    }
}

const axios = require('axios');

async function saveLog(data) {
    const { sender, sender_name, message, classification, reason } = data;
    try {
        await pool.query(
            'INSERT INTO logs (sender, sender_name, message, classification, reason) VALUES ($1, $2, $3, $4, $5)',
            [sender, sender_name, message, classification, reason]
        );
        
        // Notify dashboard for real-time update
        const dashboardUrl = process.env.DASHBOARD_URL || 'http://wa-dashboard:3000';
        axios.post(`${dashboardUrl}/api/internal/notify`, {
            ...data,
            timestamp: new Date().toISOString()
        }, {
            headers: { 'x-api-key': process.env.INTERNAL_API_KEY }
        }).catch(() => { /* Ignore if dashboard is down */ });

    } catch (err) {
        console.error('[DB] Error saving log:', err.message);
    }
}

module.exports = { pool, initDB, saveLog };
