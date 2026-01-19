const OrderModel = require('../../models/orderModels');
const { generateUniqueOrderId, loopUntilUnique } = require('../../utils/orderUtils');

/**
 * Crée une commande avec un ID unique
 * @param {Object} orderData 
 */
const createOrderService = async (orderData) => {
    const {
        vitrineId,
        products,
        clientName,
        clientPhone,
        deliveryAddress,
        deliveryLocation,
        totalPrice,
        notes,
        ...otherData
    } = orderData;

    // Générer un ID unique pour la commande
    const orderId = await loopUntilUnique(
        generateUniqueOrderId,
        OrderModel.isOrderIdUnique
    );

    const newOrder = {
        ...otherData,
        orderId,
        vitrineId,
        products: products || [],
        clientName,
        clientPhone,
        deliveryAddress,
        deliveryLocation: deliveryLocation || null,
        totalPrice: Number(totalPrice) || 0,
        notes: notes || null,
        status: orderData.status || 'pending',
        createdAt: new Date().toISOString()
    };

    return await OrderModel.create(newOrder);
};

module.exports = createOrderService;
