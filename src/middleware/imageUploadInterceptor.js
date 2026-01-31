const imageStorage = require('../utils/imageStorage');

/**
 * Middleware qui intercepte les fichiers de Multer et les upload
 * vers Cloudinary.
 */
const imageUploadInterceptor = (folder = 'products') => {
    return async (req, res, next) => {
        console.log(`[imageUploadInterceptor] Intercepting request for folder: ${folder}`);

        if (!imageStorage.isAvailable()) {
            console.warn("[imageUploadInterceptor] Stockage indisponible (Cloudinary non configuré).");
            req.imageWarning = "Le traitement d'image est temporairement indisponible.";

            const fs = require('fs').promises;
            const cleanup = (f) => f && f.path && fs.unlink(f.path).catch(() => { });
            if (req.files) req.files.forEach(cleanup);
            if (req.file) cleanup(req.file);

            return next();
        }

        try {
            // 1. Initialiser et Sanitizer req.body.images existant
            let existingImages = req.body.images;
            console.log(`[imageUploadInterceptor] Raw req.body.images:`, existingImages);

            if (typeof existingImages === 'string') {
                try {
                    existingImages = JSON.parse(existingImages);
                    console.log(`[imageUploadInterceptor] Parsed images from JSON:`, existingImages);
                } catch (e) {
                    existingImages = [existingImages];
                }
            }

            if (Array.isArray(existingImages)) {
                existingImages = existingImages.filter(img =>
                    typeof img === 'string' &&
                    (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('res.cloudinary.com'))
                );
                console.log(`[imageUploadInterceptor] Sanitized existing images (remote only):`, existingImages);
            } else {
                existingImages = [];
            }

            // On réassigne pour être sûr (sera complété par les uploads)
            req.body.images = existingImages;

            // 2. Traitement des uploads (Multer)
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                console.log(`[imageUploadInterceptor] Reçu ${req.files.length} fichiers via Multer`);
                const urls = await Promise.all(req.files.map(async (file, index) => {
                    console.log(`[imageUploadInterceptor] Uploading file ${index}:`, file.originalname);
                    const url = await imageStorage.upload(file, folder);
                    console.log(`[imageUploadInterceptor] Fichier ${index} uploadé vers Cloudinary: ${url}`);
                    return url;
                }));
                const validUrls = urls.filter(Boolean);

                // Concaténer avec les images existantes (déjà sanitizées)
                req.body.images = req.body.images.concat(validUrls);
                console.log(`[imageUploadInterceptor] Final req.body.images:`, req.body.images);
            }
            else if (req.file) {
                console.log(`[imageUploadInterceptor] Reçu 1 fichier unique via Multer:`, req.file.originalname);
                const url = await imageStorage.upload(req.file, folder);
                if (url) {
                    req.body.images = [url];
                    if (req.file.fieldname) req.body[req.file.fieldname] = url;
                    console.log(`[imageUploadInterceptor] Single file upload success: ${url}`);
                }
            } else {
                console.log(`[imageUploadInterceptor] Aucun nouveau fichier reçu via Multer.`);
            }

            next();
        } catch (error) {
            console.error('[imageUploadInterceptor] CRITICAL ERROR:', error);
            req.imageWarning = "Une erreur est survenue lors du traitement des images.";
            next();
        }
    };
};

module.exports = imageUploadInterceptor;
