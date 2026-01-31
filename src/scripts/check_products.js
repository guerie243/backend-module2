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
        const products = db.collection('Products');

        const allProducts = await products.find().limit(5).toArray();

        console.log("Found products:");
        console.log(JSON.stringify(allProducts, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

main();
