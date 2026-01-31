const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const orders = db.collection('Orders');

        const lastOrder = await orders.find().sort({ createdAt: -1 }).limit(1).toArray();

        if (lastOrder.length > 0) {
            console.log("Last Order found:");
            console.log(JSON.stringify(lastOrder[0], null, 2));
        } else {
            console.log("No orders found.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

main();
