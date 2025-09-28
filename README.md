# TradeView Crypto

Application de trading et d'analyse de cryptomonnaies supportant Bitcoin, Ethereum et Solana.

## Structure du Projet

```
PREMIERWEB/
├── database/
│   ├── BTC/
│   │   ├── BTC_create_database.js
│   │   └── package.json
│   ├── ETHEREUM/
│   │   ├── ETHEREUM_create_database.js
│   │   └── package.json
│   └── SOLANA/
│       ├── SOLANA_create_database.js
│       └── package.json
├── package.json
└── server.js
```

## Fonctionnalités

- Récupération de données historiques depuis Binance
- Support de multiples timeframes (1h, 4h, 1d)
- Stockage en base de données SQLite
- 6 mois d'historique pour chaque crypto

## Installation

1. Cloner le repository :
```bash
git clone [URL_DU_REPO]
cd PREMIERWEB
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les bases de données :
```bash
cd database/BTC && npm install && node BTC_create_database.js
cd ../ETHEREUM && npm install && node ETHEREUM_create_database.js
cd ../SOLANA && npm install && node SOLANA_create_database.js
```

## Technologies Utilisées

- Node.js
- SQLite3
- Binance API
- ES Modules