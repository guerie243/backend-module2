const axios = require("axios");
const { sendFirebaseNotification } = require("./clients/firebase.client");
const { sendWebPushNotification } = require("./clients/web-push.client");
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
        ).catch(err => {
            console.error("[NOTIFY] Erreur lors de la récupération de la vitrine:", err.message);
            throw err;
        });

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
        ).catch(err => {
            console.error("[NOTIFY] Erreur lors de la récupération des tokens:", err.message);
            throw err;
        });

        const { firebaseTokens = [], webPushSubscriptions = [] } = tokensResponse.data;

        console.log("[NOTIFY] Tokens récupérés:", {
            firebaseTokensCount: firebaseTokens.length,
            webPushSubscriptionsCount: webPushSubscriptions.length,
        });

        // 📌 3. Préparer le payload personnalisé avec les détails de la commande
        const clientInfo = order.clientName
            ? `Client: ${order.clientName}`
            : `Tél: ${order.clientPhone}`;

        const locationInfo = order.deliveryAddress ? ` - ${order.deliveryAddress}` : '';

        // Résumé des produits
        let productsSummary = '';
        if (order.products && order.products.length > 0) {
            if (order.products.length === 1) {
                productsSummary = `${order.products[0].quantity}x ${order.products[0].productName}`;
            } else {
                productsSummary = `${order.products.length} articles`;
            }
        } else if (order.productName) {
            // Rétrocompatibilité
            productsSummary = `${order.quantity || 1}x ${order.productName}`;
        } else {
            productsSummary = "Nouvelle commande";
        }

        const notificationTitle = "🛒 Nouvelle commande !";
        const notificationBody = `${productsSummary} - ${clientInfo}${locationInfo}`;

        const payload = {
            notification: {
                title: notificationTitle,
                body: notificationBody,
            },
            data: {
                orderId: String(order.orderId),
                vitrineId: String(order.vitrineId),
                clientPhone: order.clientPhone || "",
                clientName: order.clientName || "",
                address: order.deliveryAddress || "",
                type: "new_order",
            },
        };

        console.log("[NOTIFY] Payload préparé:", {
            title: notificationTitle,
            body: notificationBody,
            data: payload.data
        });

        // 📌 4. Envoyer via les différents canaux en parallèle (sans bloquer)
        const promises = [];

        // Firebase (FCM)
        firebaseTokens.forEach(token => {
            promises.push(
                sendFirebaseNotification(token, payload)
                    .then(() => console.log("[FIREBASE] Notification envoyée:", token.substring(0, 10) + "..."))
                    .catch(err => console.error("[FIREBASE] Erreur pour token", token.substring(0, 10), ":", err.message))
            );
        });

        // WebPush
        webPushSubscriptions.forEach(sub => {
            promises.push(
                sendWebPushNotification(sub, payload.notification)
                    .then(() => console.log("[WEBPUSH] Notification envoyée:", sub.endpoint.substring(0, 30) + "..."))
                    .catch(err => console.error("[WEBPUSH] Erreur pour endpoint", sub.endpoint.substring(0, 30), ":", err.message))
            );
        });

        // Utilisation de allSettled pour ne pas échouer si une seule promesse échoue
        Promise.allSettled(promises).then((results) => {
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const failureCount = results.filter(r => r.status === 'rejected').length;
            console.log(`[NOTIFY] Dispatch Push terminé: ${successCount} succès, ${failureCount} échecs.`);
        });

    }
    catch (err) {
        console.error("[NOTIFY] Erreur critique lors du traitement:", err.message);
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
        if (order.clientPhone) {
            const firstProduct = order.products?.[0]?.productName || "votre commande";
            const summary = order.products?.length > 1 ? `${firstProduct} et ${order.products.length - 1} autres` : firstProduct;

            await whatsappService.sendTemplate(order.clientPhone, "order_received_customer", {
                username: order.clientName || "Cher client",
                productName: summary,
                quantity: order.products?.length || 1,
                orderId: order.orderId
            }).catch(err => console.error("[WA-NOTIFY] Erreur envoi client:", err.message));
        }

        // 2. Notification au propriétaire de la vitrine (si on a son WhatsApp)
        // Note: vitrineWhatsApp n'est plus directement envoyé par le frontend, 
        // il faudrait le récupérer depuis la vitrine si nécessaire.
        if (order.vitrineWhatsApp) {
            const firstProduct = order.products?.[0]?.productName || "produit";
            await whatsappService.sendTemplate(order.vitrineWhatsApp, "order_received_owner", {
                ownerName: "Propriétaire",
                customerName: order.clientName || "Un client",
                productName: firstProduct,
                quantity: order.products?.length || 1,
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

        if (order.clientPhone) {
            console.log(`[WA-NOTIFY] Envoi notification WhatsApp (${order.status}) à ${order.clientPhone}`);
            await whatsappService.sendTemplate(order.clientPhone, templateName, {
                username: order.clientName || "Cher client",
                orderId: order.orderId,
                productName: order.products?.[0]?.productName || "votre commande",
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
