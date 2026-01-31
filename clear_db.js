
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

async function clearProducts() {
    if (!uri) {
        console.error('MONGODB_URI is missing');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('Products');

        const result = await collection.deleteMany({});
        console.log(`Cleared ${result.deletedCount} products from the database.`);

    } catch (error) {
        console.error('Error clearing products:', error);
    } finally {
        await client.close();
    }
}

clearProducts();
