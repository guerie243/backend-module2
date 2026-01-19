const imageStorage = require('../utils/imageStorage');

/**
 * Middleware qui intercepte les fichiers de Multer et les upload
 * vers Cloudinary.
 */
const imageUploadInterceptor = (folder = 'products') => {
    return async (req, res, next) => {
        if (!imageStorage.isAvailable()) {
            console.warn("[imageUploadInterceptor] Stockage indisponible.");
            req.imageWarning = "Le traitement d'image est temporairement indisponible.";

            const fs = require('fs').promises;
            const cleanup = (f) => f && f.path && fs.unlink(f.path).catch(() => { });
            if (req.files) req.files.forEach(cleanup);
            if (req.file) cleanup(req.file);

            return next();
        }

        try {
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                const urls = await Promise.all(req.files.map(file => imageStorage.upload(file, folder)));
                const validUrls = urls.filter(Boolean);
                req.body.images = (req.body.images || []).concat(validUrls);
            }
            else if (req.file) {
                const url = await imageStorage.upload(req.file, folder);
                if (url) {
                    req.body.images = [url];
                    if (req.file.fieldname) req.body[req.file.fieldname] = url;
                }
            }
            next();
        } catch (error) {
            console.error('Erreur Intercepteur Image:', error);
            req.imageWarning = "Une erreur est survenue lors du traitement des images.";
            next();
        }
    };
};

module.exports = imageUploadInterceptor;
