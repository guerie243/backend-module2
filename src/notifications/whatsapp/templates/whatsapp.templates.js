/**
 * Templates de messages WhatsApp.
 * Chaque fonction retourne les données formatées pour le provider.
 */
const templates = {
    /**
     * Notification pour le client à la réception de sa commande
     */
    order_received_customer: ({ username, productName, quantity, orderId }) => ({
        username,
        productName,
        quantity,
        orderId
    }),

    /**
     * Notification pour le propriétaire de la vitrine à la réception d'une nouvelle commande
     */
    order_received_owner: ({ ownerName, customerName, productName, quantity, orderId }) => ({
        ownerName,
        customerName,
        productName,
        quantity,
        orderId
    }),

    /**
     * Notification pour le client quand sa commande est acceptée
     */
    order_accepted: ({ username, orderId, productName }) => ({
        username,
        orderId,
        productName
    }),

    /**
     * Notification pour le client quand sa commande est refusée
     */
    order_rejected: ({ username, orderId, reason, productName }) => ({
        username,
        orderId,
        reason,
        productName
    })
};

module.exports = { templates };
