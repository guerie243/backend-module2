const { getDb } = require('../config/db');

const COLLECTION = 'SyncPhrases';

const SyncModel = {
    getCollection: () => {
        return getDb().collection(COLLECTION);
    },

    getPhrase: async () => {
        return await SyncModel.getCollection().findOne({}, { sort: { createdAt: -1 } });
    },

    setPhrase: async (phrase) => {
        // Supprimer les anciennes phrases pour n'en garder qu'une
        await SyncModel.getCollection().deleteMany({});
        const data = {
            phrase,
            createdAt: new Date().toISOString()
        };
        await SyncModel.getCollection().insertOne(data);
        return data;
    },

    deletePhrase: async () => {
        return await SyncModel.getCollection().deleteMany({});
    }
};

module.exports = SyncModel;
