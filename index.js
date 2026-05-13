const { createClient } = require('./src/services/whatsappService');
const { initBot } = require('./src/controllers/botController');
const { initDB } = require('./src/models/database');

/**
 * ENTRY POINT: WHATSAPP FILTER ENGINE (MVC VERSION)
 */
async function bootstrap() {
    console.log('===================================================');
    console.log('🚀 WA FILTER ENGINE - MVC VERSION');
    console.log('===================================================');
    
    try {
        // 1. Initialize Database (Wait until ready)
        await initDB();

        // 2. Initialize WhatsApp Client
        const client = createClient();

        // 3. Initialize Bot Controller (Logic & Queue)
        initBot(client);

        // 4. Start Client
        console.log('[System] Waiting 5 seconds for stability...');
        await new Promise(r => setTimeout(r, 5000));
        
        console.log('[System] Initializing WhatsApp Client...');
        await client.initialize();

        client.on('ready', () => {
            console.log('✅ WhatsApp Engine is Ready & Filtering.');
        });

    } catch (err) {
        console.error('[Fatal] Failed to start engine:', err.message);
        // Jangan langsung exit agar Docker bisa me-restart otomatis jika perlu
        // tapi beri jeda agar tidak looping terlalu cepat
        setTimeout(() => process.exit(1), 5000);
    }
}

bootstrap();
