const { getDb } = require('../config/db');

const COLLECTION = 'UserActivities';

const ActivityModel = {
    getCollection: () => {
        return getDb().collection(COLLECTION);
    },

    create: async (activity) => {
        const data = {
            ...activity,
            ipAddress: activity.ipAddress || 'Unknown',
            createdAt: new Date().toISOString()
        };
        await ActivityModel.getCollection().insertOne(data);
        return activity;
    },

    findByUserId: async (userId, skip = 0, limit = 50) => {
        return await ActivityModel.getCollection()
            .find({ userId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
    },

    findAll: async (skip = 0, limit = 100) => {
        return await ActivityModel.getCollection()
            .find({})
            .sort({ createdAt: -1 }) // Plus récents en premier
            .skip(skip)
            .limit(limit)
            .toArray();
    },

    count: async () => {
        return await ActivityModel.getCollection().countDocuments();
    },

    deleteAll: async () => {
        return await ActivityModel.getCollection().deleteMany({});
    }
};

module.exports = ActivityModel;
