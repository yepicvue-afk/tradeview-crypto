import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configuration du moteur de template EJS
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'TradeView Crypto',
        description: 'Plateforme d\'analyse de cryptomonnaies',
        data: []
    });
});

// Route pour BTC
app.get('/btc', (req, res) => {
    const db = new sqlite3.Database('./database/BTC/BTC_data.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Erreur de connexion à la base:', err);
            return res.status(500).send('Erreur de base de données');
        }

        // Récupérer les 24 dernières heures de données
        const query = `
            SELECT * FROM data_1h 
            ORDER BY timestamp DESC 
            LIMIT 24
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Erreur de requête:', err);
                return res.status(500).send('Erreur de requête');
            }

            res.render('crypto', {
                title: 'Bitcoin Analysis',
                crypto: 'BTC',
                description: 'Analyse du Bitcoin',
                data: rows
            });

            // Fermer la connexion
            db.close();
        });
    });
});

// Route pour ETH
app.get('/eth', (req, res) => {
    res.render('crypto', {
        title: 'Ethereum Analysis',
        crypto: 'ETH',
        description: 'Analyse de l\'Ethereum',
        data: []
    });
});

// Route pour SOL
app.get('/sol', (req, res) => {
    res.render('crypto', {
        title: 'Solana Analysis',
        crypto: 'SOL',
        description: 'Analyse de Solana',
        data: []
    });
});

// API Routes
app.get('/api/crypto/:symbol/:timeframe', (req, res) => {
    const { symbol, timeframe } = req.params;
    // TODO: Implémenter la récupération des données depuis SQLite
    res.json({ message: `Data for ${symbol} in ${timeframe} timeframe` });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Page non trouvée',
        description: 'La page demandée n\'existe pas'
    });
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
