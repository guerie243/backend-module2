// Import d'Express
const express = require('express');
const cors = require('cors');
// Import des configurations
require('./src/config/config');
const { connectToDatabase } = require('./src/config/db');

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Middleware pour CORS
app.use(cors());

// Middleware pour lire les données JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import des routes
const productRoutes = require('./src/routes/productRoutes');
const commandRoutes = require('./src/routes/orderRoutes');
const activityRoutes = require('./src/routes/activityRoutes');

// Création d'un routeur API pour regrouper toutes les routes
const apiRouter = express.Router();

// Connexion des routes au routeur API
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', commandRoutes);
apiRouter.use('/activities', activityRoutes);

// Montage du routeur API sur '/' et '/api'
app.use('/', apiRouter);
app.use('/api', apiRouter);

// Route d'accueil
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bienvenue sur l\'API du Module 2',
        endpoints: {
            products: '/products',
            orders: '/orders',
            activities: '/activities',
            health: '/health'
        }
    });
});

// Route de santé pour tester le serveur
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Serveur de Module 2 en bonne santé',
        timestamp: new Date()
    });
});

// Middleware de gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        path: req.path
    });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Erreur globale:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur interne du serveur'
    });
});

// Lancement du serveur après connexion à la base de données
const startServer = async () => {
    try {
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`✅ Serveur Module 2 lancé sur le port ${PORT}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Échec du démarrage du serveur en raison d'une erreur de base de données:", error.message);
        process.exit(1);
    }
};

startServer();
