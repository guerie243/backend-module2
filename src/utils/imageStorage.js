const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const storageConfig = require('../config/storageConfig');

const config = storageConfig.cloudinary;
const isCloudinaryConfigured = !!(config.cloud_name && config.api_key && config.api_secret);

if (isCloudinaryConfigured) {
    cloudinary.config(config);
}

const imageStorage = {
    /**
     * Vérifie si le stockage est disponible
     */
    isAvailable: () => isCloudinaryConfigured,

    /**
     * Upload une image vers Cloudinary uniquement
     */
    upload: async (file, folder) => {
        if (!file) return null;

        if (!isCloudinaryConfigured) {
            console.warn("[imageStorage] Cloudinary non configuré. Upload annulé.");
            if (file.path) await fs.unlink(file.path).catch(() => { });
            return null;
        }

        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: `${storageConfig.rootFolder}/${folder}`,
                use_filename: true,
                unique_filename: true
            });
            if (file.path) await fs.unlink(file.path).catch(() => { });
            return result.secure_url;
        } catch (error) {
            console.error("Erreur upload Cloudinary:", error.message);
            if (file.path) await fs.unlink(file.path).catch(() => { });
            return null;
        }
    },

    /**
     * Supprime une image via son URL
     */
    delete: async (url) => {
        if (!url || !isCloudinaryConfigured || !url.includes('cloudinary')) return;

        try {
            const parts = url.split('/');
            const folderIndex = parts.indexOf(storageConfig.rootFolder);
            if (folderIndex !== -1) {
                const publicId = parts.slice(folderIndex).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (err) {
            console.error("Erreur suppression Cloudinary:", err.message);
        }
    },

    /**
     * Remplace une ancienne image par une nouvelle
     */
    replace: async (oldUrl, newFile, folder) => {
        if (oldUrl) await imageStorage.delete(oldUrl);
        return await imageStorage.upload(newFile, folder);
    }
};

module.exports = imageStorage;
