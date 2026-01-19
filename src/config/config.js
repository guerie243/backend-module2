const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement depuis le fichier .env à la racine du backend
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

module.exports = {
    HASH_SECRET: process.env.HASH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'Module2DB',
    MODULE1_API_URL: process.env.MODULE1_API_URL || 'http://localhost:3000/api',
    CLOUDINARY: {
        CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: process.env.CLOUDINARY_API_KEY,
        API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    FIREBASE: {
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    },
    WEBPUSH: {
        CONTACT_EMAIL: process.env.WEB_PUSH_CONTACT_EMAIL,
        PUBLIC_KEY: process.env.WEB_PUSH_PUBLIC_VAPID_KEY,
        PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_VAPID_KEY
    },
    SENDZEN: {
        API_KEY: process.env.SENDZEN_API_KEY,
        API_URL: process.env.SENDZEN_API_URL || 'https://api.sendzen.com/v1/messages/send'
    }
};
