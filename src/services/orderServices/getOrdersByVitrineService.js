const OrderModel = require('../../models/orderModels');

/**
 * Récupère les commandes d'une vitrine
 * @param {string} vitrineId 
 */
const getOrdersByVitrineService = async (vitrineId) => {
    return await OrderModel.findByVitrineId(vitrineId);
};

module.exports = getOrdersByVitrineService;
