const { getDb } = require('../config/db');

const COLLECTION = 'Orders';

const OrderModel = {
    getCollection: () => {
        return getDb().collection(COLLECTION);
    },

    create: async (order) => {
        const data = { ...order, _id: order.orderId };
        await OrderModel.getCollection().insertOne(data);
        return order;
    },

    isOrderIdUnique: async (orderId) => {
        const count = await OrderModel.getCollection().countDocuments({ _id: orderId }, { limit: 1 });
        return count === 0;
    },

    update: async (orderId, updates) => {
        const result = await OrderModel.getCollection().findOneAndUpdate(
            { _id: orderId },
            { $set: { ...updates, updatedAt: new Date().toISOString() } },
            { returnDocument: 'after' }
        );
        return result;
    },

    findById: async (orderId) => {
        return await OrderModel.getCollection().findOne({ _id: orderId });
    },

    findByVitrineId: async (vitrineId) => {
        return await OrderModel.getCollection().find({ vitrineId }).sort({ createdAt: -1 }).toArray();
    },

    findAll: async () => {
        return await OrderModel.getCollection().find({}).toArray();
    }
};

module.exports = OrderModel;
