const OrderModel = require('../../models/orderModels');

/**
 * Récupère une commande par son ID
 * @param {string} orderId 
 */
const getOrderByIdService = async (orderId) => {
    return await OrderModel.findById(orderId);
};

module.exports = getOrderByIdService;
