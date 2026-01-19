const config = require('./config');

/**
 * Configuration pour le stockage des images (Cloudinary)
 */
module.exports = {
    cloudinary: {
        cloud_name: config.CLOUDINARY.CLOUD_NAME,
        api_key: config.CLOUDINARY.API_KEY,
        api_secret: config.CLOUDINARY.API_SECRET
    },
    // Dossier racine pour l'application dans Cloudinary (Module 2)
    rootFolder: 'module2_app'
};
