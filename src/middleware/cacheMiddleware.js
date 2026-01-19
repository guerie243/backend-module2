const { cache, getCacheKey } = require('../utils/cache');

/**
 * Middleware de cache pour les requêtes GET
 */
const cacheMiddleware = (req, res, next) => {
    // On ne cache que les requêtes GET
    if (req.method !== 'GET') {
        return next();
    }

    const key = getCacheKey(req);
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        console.log(`Cache hit for: ${key}`);
        return res.json(cachedResponse);
    }

    // Si pas dans le cache, on surcharge res.json pour capturer la réponse
    console.log(`Cache miss for: ${key}`);
    const originalJson = res.json;
    res.json = function (body) {
        // On ne met en cache que les réponses 2xx
        if (res.statusCode >= 200 && res.statusCode < 300) {
            cache.set(key, body);
        }
        return originalJson.call(this, body);
    };

    next();
};

module.exports = cacheMiddleware;
