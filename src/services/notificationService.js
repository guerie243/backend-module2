const axios = require("axios");
const { sendFirebaseNotification } = require("../clients/firebaseClient");
const { sendWebPushNotification } = require("../clients/webPushClient");
const SendZenProvider = require("./whatsapp/providers/sendzen.provider");
const WhatsAppService = require("./whatsapp/whatsapp.service");

// Initialisation du service WhatsApp avec le provider SendZen
const whatsappProvider = new SendZenProvider();
const whatsappService = new WhatsAppService(whatsappProvider);

const config = require("../config/config");

/**
 * Envoie une notification au propriétaire d'une vitrine lors de la création d'une commande
 * @param {Object} order - Données de la commande créée
 */
async function notifyOrderCreated(order) {
    console.log("[NOTIFY] Début envoi de notification pour commande:", order.orderId);

    try {
        // 📌 1. Récupérer les informations de la vitrine depuis Module 1
        if (!order.vitrineId) {
            console.warn("[NOTIFY] Pas de vitrineId trouvé dans la commande, annulation.");
            return;
        }

        console.log("[NOTIFY] Récupération de la vitrine:", order.vitrineId);
        const vitrineResponse = await axios.get(
            `${config.MODULE1_API_URL}/vitrines/id/${order.vitrineId}`
        );

        const vitrine = vitrineResponse.data.vitrine;

        if (!vitrine || !vitrine.ownerId) {
            console.warn("[NOTIFY] Vitrine trouvée mais ownerId manquant, annulation.");
            return;
        }

        const ownerId = vitrine.ownerId;
        console.log("[NOTIFY] OwnerId récupéré:", ownerId);

        // 📌 2. Récupérer les tokens de notification de l'utilisateur depuis Module 1
        const tokensResponse = await axios.get(
            `${config.MODULE1_API_URL}/users/${ownerId}/notifications`
        );

        const { firebaseTokens = [], webPushSubscriptions = [] } = tokensResponse.data;

        console.log("[NOTIFY] Tokens récupérés:", {
            firebaseTokensCount: firebaseTokens.length,
            webPushSubscriptionsCount: webPushSubscriptions.length,
        });

        // 📌 3. Préparer le payload personnalisé avec les détails de la commande
        const customerInfo = order.customerName
            ? `Client: ${order.customerName}`
            : `WhatsApp: ${order.customerWhatsApp}`;

        const locationInfo = order.lieu ? ` - ${order.lieu}` : '';

        const notificationTitle = "🛒 Nouvelle commande !";
        const notificationBody = `${order.quantity}x produit${order.quantity > 1 ? 's' : ''} - ${customerInfo}${locationInfo}`;

        const payload = {
            notification: {
                title: notificationTitle,
                body: notificationBody,
            },
            data: {
                orderId: String(order.orderId),
                vitrineId: String(order.vitrineId),
                productId: String(order.productId),
                quantity: String(order.quantity),
                customerWhatsApp: order.customerWhatsApp || "",
                customerName: order.customerName || "",
                lieu: order.lieu || "",
                address: order.address || "",
                type: "new_order",
            },
        };

        console.log("[NOTIFY] Payload préparé:", {
            title: notificationTitle,
            body: notificationBody,
            data: payload.data
        });

        // 📌 4. Envoyer via Firebase si disponible
        for (const token of firebaseTokens) {
            sendFirebaseNotification(token, payload)
                .then(() => console.log("[FIREBASE] Notification envoyée:", token))
                .catch(err => console.error("[FIREBASE] Erreur:", err.message));
        }

        // 📌 5. Envoyer via WebPush si disponible
        for (const sub of webPushSubscriptions) {
            sendWebPushNotification(sub, payload.notification)
                .then(() => console.log("[WEBPUSH] Notification envoyée:", sub.endpoint))
                .catch(err => console.error("[WEBPUSH] Erreur:", err.message));
        }

        console.log("[NOTIFY] Envoi terminé (sans bloquer la commande).");
    }
    catch (err) {
        console.error("[NOTIFY] Erreur lors du traitement:", err.message);
        if (err.response) {
            console.error("[NOTIFY] Détails erreur API:", {
                status: err.response.status,
                data: err.response.data
            });
        }
    }
}

/**
 * Envoie des notifications WhatsApp lors de la création d'une commande
 * @param {Object} order - Détails de la commande
 */
async function notifyWhatsAppOrderCreated(order) {
    try {
        console.log("[WA-NOTIFY] Envoi des notifications WhatsApp pour la commande:", order.orderId);

        // 1. Notification au client
        if (order.customerWhatsApp) {
            await whatsappService.sendTemplate(order.customerWhatsApp, "order_received_customer", {
                username: order.customerName || "Cher client",
                productName: order.productName || "votre commande",
                quantity: order.quantity,
                orderId: order.orderId
            }).catch(err => console.error("[WA-NOTIFY] Erreur envoi client:", err.message));
        }

        // 2. Notification au propriétaire de la vitrine
        if (order.vitrineWhatsApp) {
            await whatsappService.sendTemplate(order.vitrineWhatsApp, "order_received_owner", {
                ownerName: "Propriétaire", // Optionnel si on récupère le nom
                customerName: order.customerName || "Un client",
                productName: order.productName || "produit",
                quantity: order.quantity,
                orderId: order.orderId
            }).catch(err => console.error("[WA-NOTIFY] Erreur envoi proprio:", err.message));
        }
    } catch (err) {
        console.error("[WA-NOTIFY] Erreur globale orderCreated:", err.message);
    }
}

/**
 * Envoie une notification WhatsApp au client lors de la mise à jour du statut
 * @param {Object} order - Détails de la commande mise à jour
 */
async function notifyWhatsAppOrderStatusUpdated(order) {
    try {
        if (!order.customerWhatsApp) return;

        let templateName = "";
        if (order.status === "accepted") {
            templateName = "order_accepted";
        } else if (order.status === "rejected") {
            templateName = "order_rejected";
        }

        if (templateName) {
            console.log(`[WA-NOTIFY] Envoi notification WhatsApp (${order.status}) à ${order.customerWhatsApp}`);
            await whatsappService.sendTemplate(order.customerWhatsApp, templateName, {
                username: order.customerName || "Cher client",
                orderId: order.orderId,
                productName: order.productName || "votre commande",
                reason: order.rejectionReason || "Non spécifié"
            });
        }
    } catch (err) {
        console.error("[WA-NOTIFY] Erreur orderStatusUpdated:", err.message);
    }
}

module.exports = {
    notifyOrderCreated,
    notifyWhatsAppOrderCreated,
    notifyWhatsAppOrderStatusUpdated
};
