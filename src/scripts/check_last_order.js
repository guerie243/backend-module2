const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Andybusiness:z2YDj4voUSKUjnqO@andybusinessdb.kpcvirh.mongodb.net/?appName=AndyBusinessDB";
const dbName = "AndyBusinessDB";

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
