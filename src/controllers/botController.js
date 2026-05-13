const config = require('../config/config');
const { saveLog } = require('../models/database');
const { checkWithLocalAI } = require('../services/aiService');

const messageQueue = [];
const MAX_CONCURRENT = 2; // Fokus 2 pesan agar CPU tidak terbagi dan respon lebih cepat
let currentProcessing = 0;

async function handleMessage(client, msg) {
    try {
        if (msg.fromMe || msg.from === 'status@broadcast') return;

        const contact = await msg.getContact();
        
        // Whitelist Check: Saved Contacts
        if (contact.isMyContact) {
            await saveLog({
                sender: msg.from,
                sender_name: contact.name || contact.number,
                message: msg.body,
                classification: 'SKIP',
                reason: 'Kontak Tersimpan'
            });
            return;
        }

        const isGroup = msg.from.endsWith('@g.us');
        const tipeObrolan = isGroup ? "GRUP" : "PRIBADI";
        const textLower = msg.body.toLowerCase();
        
        console.log(`[Pesan Masuk] Dari: ${contact.pushname || contact.number} | Tipe: ${tipeObrolan} | Isi: ${msg.body.substring(0, 50)}...`);

        let isSpam = false;
        let filterType = "";

        // 1. Keyword Blacklist
        if (config.rules.blacklist.some(word => textLower.includes(word))) {
            isSpam = true;
            filterType = "Keyword Blacklist";
        } 
        // 2. Keyword Whitelist 
        else if (config.rules.whitelist.some(word => textLower.includes(word))) {
            isSpam = false; 
            console.log(`[WHITELIST] Pesan mengandung kata aman.`);
        }
        // 3. AI Analysis
        else if (textLower.length > 0 && textLower.length <= 1500) {
            console.log(`[AI Analysis] Menganalisis pesan via Ollama...`);
            isSpam = await checkWithLocalAI(msg.body);
            if (isSpam) filterType = "AI Analysis";
        }

        if (isSpam) {
            console.log(`⚠️ [SPAM TERDETEKSI - ${filterType}]`);
            try {
                await msg.delete(); 
                console.log(`✅ Message deleted successfully.\n`);
            } catch (delErr) {
                console.log(`❌ Failed to delete message.\n`);
            }
        }

        await saveLog({
            sender: msg.from,
            sender_name: contact.pushname || contact.name || contact.number,
            message: msg.body,
            classification: isSpam ? 'JOKI' : 'SAFE',
            reason: filterType || 'AI Analysis'
        });

    } catch (err) {
        console.error(`❌ BotController Error:`, err.message);
    }
}

async function processQueue(client) {
    while (true) {
        if (messageQueue.length > 0 && currentProcessing < MAX_CONCURRENT) {
            const msg = messageQueue.shift();
            currentProcessing++;
            handleMessage(client, msg).finally(() => {
                currentProcessing--;
            });
        } else {
            await new Promise(r => setTimeout(r, 10)); // Jeda diperkecil agar respon instan
        }
    }
}

function initBot(client) {
    client.on('message_create', (msg) => {
        messageQueue.push(msg);
    });

    processQueue(client);
}

module.exports = { initBot };
