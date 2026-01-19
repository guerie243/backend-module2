const webPush = require("web-push");
const config = require("../config/config");

let isConfigured = false;

function initWebPushClient() {
    if (isConfigured) return;

    webPush.setVapidDetails(
        config.WEBPUSH.CONTACT_EMAIL,
        config.WEBPUSH.PUBLIC_KEY,
        config.WEBPUSH.PRIVATE_KEY
    );

    isConfigured = true;
    console.log("[WEBPUSH] Client initialisé.");
}

/**
 * subscription = {
 *   endpoint: "...",
 *   keys: { p256dh: "...", auth: "..." }
 * }
 */
function sendWebPushNotification(subscription, payload) {
    initWebPushClient();
    return webPush.sendNotification(subscription, JSON.stringify(payload));
}

module.exports = { sendWebPushNotification };
