const admin = require("firebase-admin");
const config = require("../../config/config");

let firebaseApp = null;

function initFirebaseClient() {
    if (firebaseApp) return firebaseApp;

    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: config.FIREBASE.PROJECT_ID,
            clientEmail: config.FIREBASE.CLIENT_EMAIL,
            privateKey: config.FIREBASE.PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });

    console.log("[FIREBASE] Client initialisé.");
    return firebaseApp;
}

function sendFirebaseNotification(token, payload) {
    initFirebaseClient();
    return admin.messaging().sendToDevice(token, payload);
}

module.exports = { sendFirebaseNotification };
