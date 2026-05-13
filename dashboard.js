const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const config = require('./src/config/config');
const { initDB } = require('./src/models/database');
const { initAPI } = require('./src/controllers/apiController');

/**
 * ENTRY POINT: REAL-TIME DASHBOARD SERVER
 */
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Controller (Routes & Socket.io)
initAPI(app, io);

// Start Server
initDB().then(() => {
    server.listen(config.server.port, '0.0.0.0', () => {
        console.log(`\n===================================================`);
        console.log(`🚀 REAL-TIME DASHBOARD at http://localhost:${config.server.port}`);
        console.log(`===================================================\n`);
    });
}).catch(err => {
    console.error('[Fatal] Dashboard failed to start:', err.message);
});
