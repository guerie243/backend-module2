const OrderModel = require('../../models/orderModels');

/**
 * Met à jour une commande existante
 * @param {string} orderId 
 * @param {Object} updates 
 */
const updateOrderService = async (orderId, updates) => {
    const {
        quantity,
        customerWhatsApp,
        customerName,
        address,
        lieu,
        coordonnees_livraison,
        status
    } = updates;

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (customerWhatsApp !== undefined) updateData.customerWhatsApp = customerWhatsApp;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (address !== undefined) updateData.address = address;
    if (lieu !== undefined) updateData.lieu = lieu;
    if (coordonnees_livraison !== undefined) updateData.coordonnees_livraison = coordonnees_livraison;
    if (status !== undefined) updateData.status = status;

    return await OrderModel.update(orderId, updateData);
};

module.exports = updateOrderService;
