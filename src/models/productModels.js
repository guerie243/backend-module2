const { getDb } = require('../config/db');

const COLLECTION = 'Products';

const ProductModel = {
    getCollection: () => {
        return getDb().collection(COLLECTION);
    },

    create: async (product) => {
        const data = { ...product, _id: product.productId };
        await ProductModel.getCollection().insertOne(data);
        return product;
    },

    update: async (id, updates) => {
        const { ObjectId } = require('mongodb');
        // On tente d'abord par _id (String ou ObjectId)
        let query = { _id: id };
        try {
            if (ObjectId.isValid(id)) query = { _id: new ObjectId(id) };
        } catch (e) { }

        const result = await ProductModel.getCollection().findOneAndUpdate(
            query,
            { $set: { ...updates, updatedAt: new Date().toISOString() } },
            { returnDocument: 'after' }
        );
        return result;
    },

    delete: async (id) => {
        const { ObjectId } = require('mongodb');
        let query = { _id: id };
        try {
            if (ObjectId.isValid(id)) query = { _id: new ObjectId(id) };
        } catch (e) { }

        const result = await ProductModel.getCollection().findOneAndDelete(query);
        return result;
    },

    findById: async (id) => {
        const { ObjectId } = require('mongodb');

        // Try direct string match first (since we use custom string IDs like prod_...)
        let product = await ProductModel.getCollection().findOne({ _id: id });

        // If not found and looks like ObjectId, try as ObjectId
        if (!product && id && ObjectId.isValid(id)) {
            try {
                product = await ProductModel.getCollection().findOne({ _id: new ObjectId(id) });
            } catch (e) {
                console.error('[ProductModel.findById] ObjectId error:', e);
            }
        }

        return product;
    },

    findBySlug: async (slug) => {
        return await ProductModel.getCollection().findOne({ slug: slug });
    },

    findByVitrineId: async (vitrineId, skip = 0, limit = 20) => {
        return await ProductModel.getCollection()
            .find({ vitrineId: vitrineId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
    },

    isSlugUnique: async (slug) => {
        const count = await ProductModel.getCollection().countDocuments({ slug: slug }, { limit: 1 });
        return count === 0;
    },

    isProductIdUnique: async (productId) => {
        const count = await ProductModel.getCollection().countDocuments({ _id: productId }, { limit: 1 });
        return count === 0;
    },

    findAll: async (skip = 0, limit = 20) => {
        return await ProductModel.getCollection()
            .find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
    }
};

module.exports = ProductModel;
