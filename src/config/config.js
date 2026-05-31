require('dotenv').config();

module.exports = {
    // Database Config
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 5432,
    },
    
    // AI Config
    ai: {
        ollamaUrl: process.env.OLLAMA_URL || 'http://host.docker.internal:11434/api/generate',
        ollamaTesting: process.env.ollamaTesting || 'http://localhost:11434/api/generate',
        model: 'qwen2.5:7b',
    },
    
    // Security
    security: {
        internalApiKey: process.env.INTERNAL_API_KEY,
    },
    
    // Server Config
    server: {
        port: process.env.PORT || 3000,
        dashboardUrl: process.env.DASHBOARD_URL || 'http://wa-dashboard:3000',
    },
    
    // Filtering Rules
    rules: {
        blacklist: [
            "jasa joki", "joki tugas", "turnitin", 
            "joki skripsi", "pengerjaan soal uts", "jasa pengerjaan",
            "bantu kerjain tugas"
        ],
        whitelist: [
            "monsep", "sgmail", "id old", "zodiac", "vk fb", "plat",
            "jual akun", "minus", "take", "sold", "nego", "rekber", "mlbb", "pubg",
            "pake joki",
        ]
    }
};