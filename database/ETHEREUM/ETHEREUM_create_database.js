import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';

const { Database } = sqlite3.verbose();

// Configuration
const DB_FILE = 'ETHEREUM_data.db';
const SYMBOL = 'ETHUSDT';  // Changé de BTCUSDT à ETHUSDT
const TIMEFRAMES = {
    '1h': {
        table: 'data_1h',
        interval: '1h',
        binanceInterval: '1h'
    },
    '4h': {
        table: 'data_4h',
        interval: '4h',
        binanceInterval: '4h'
    },
    '1d': {
        table: 'data_1d',
        interval: '1d',
        binanceInterval: '1d'
    }
};

let db;

// Fonction principale asynchrone
async function main() {
    try {
        await initializeDatabase();
        await initializeTables();
        
        // Récupération des données pour chaque timeframe
        for (const [key, value] of Object.entries(TIMEFRAMES)) {
            await fetchAndStoreData(value.table, value.binanceInterval);
        }
        
        console.log('Toutes les données ont été récupérées avec succès');
        
        // Fermeture propre de la base de données
        await closeDatabase();
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db = new Database(DB_FILE, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la base de données:', err);
                reject(err);
                return;
            }
            console.log('Base de données créée avec succès');
            resolve();
        });
    });
}

function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error('Erreur lors de la fermeture de la base de données:', err);
                reject(err);
            } else {
                console.log('Base de données fermée avec succès');
                resolve();
            }
        });
    });
}

// Création des tables
function initializeTables() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS data_1h (
            timestamp INTEGER PRIMARY KEY,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume REAL
        );
        CREATE TABLE IF NOT EXISTS data_4h (
            timestamp INTEGER PRIMARY KEY,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume REAL
        );
        CREATE TABLE IF NOT EXISTS data_1d (
            timestamp INTEGER PRIMARY KEY,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume REAL
        );
    `;

    return new Promise((resolve, reject) => {
        db.exec(createTableSQL, (err) => {
            if (err) {
                console.error('Erreur lors de la création des tables:', err);
                reject(err);
                return;
            }
            console.log('Tables créées avec succès');
            resolve();
        });
    });
}

// Fonction pour récupérer et stocker les données
async function fetchAndStoreData(table, interval) {
    const endTime = Date.now();
    const startTime = endTime - (180 * 24 * 60 * 60 * 1000); // 180 jours (6 mois)
    
    try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
        const response = await fetch(url);
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Invalid data received from Binance');
        }

        await new Promise((resolve, reject) => {
            // Préparation de la requête d'insertion
            const insertSQL = `INSERT OR REPLACE INTO ${table} 
                (timestamp, open, high, low, close, volume) 
                VALUES (?, ?, ?, ?, ?, ?)`;

            // Insertion des données
            const stmt = db.prepare(insertSQL);
            
            for (const candle of data) {
                stmt.run(
                    candle[0], // timestamp
                    parseFloat(candle[1]), // open
                    parseFloat(candle[2]), // high
                    parseFloat(candle[3]), // low
                    parseFloat(candle[4]), // close
                    parseFloat(candle[5])  // volume
                );
            }
            
            stmt.finalize((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Données insérées avec succès pour l'intervalle ${interval}`);
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error(`Erreur lors de la récupération des données pour l'intervalle ${interval}:`, error);
        throw error;
    }
}

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
    try {
        await closeDatabase();
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la fermeture de la base de données:', error);
        process.exit(1);
    }
});

// Lancer le script
main().catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
});