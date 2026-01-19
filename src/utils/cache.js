const NodeCache = require('node-cache');

// Standard TTL de 1 heure (3600 secondes), checkperiod de 10 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Génère une clé de cache basée sur l'URL et les paramètres de la requête
 */
const getCacheKey = (req) => {
    const baseUrl = req.originalUrl || req.url;
    // Si l'utilisateur est authentifié, on ajoute son ID à la clé pour éviter les collisions
    if (req.user && req.user.userId) {
        return `${baseUrl}_user_${req.user.userId}`;
    }
    return baseUrl;
};

/**
 * Supprime les clés du cache qui correspondent à un certain préfixe
 */
const clearCacheByPrefix = (prefix) => {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.startsWith(prefix));
    if (keysToDelete.length > 0) {
        cache.del(keysToDelete);
    }
};

/**
 * Invalide tout le cache lié aux produits
 */
const invalidateProductsCache = () => {
    console.log('Invalidating products cache');
    clearCacheByPrefix('/products');
    clearCacheByPrefix('/api/products');
};

/**
 * Invalide tout le cache lié aux commandes
 */
const invalidateOrdersCache = () => {
    console.log('Invalidating orders cache');
    clearCacheByPrefix('/orders');
    clearCacheByPrefix('/api/orders');
};

module.exports = {
    cache,
    getCacheKey,
    clearCacheByPrefix,
    invalidateProductsCache,
    invalidateOrdersCache
};
