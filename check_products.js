
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('--- Environment Check ---');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');
console.log('--- End Check ---\n');

async function checkProducts() {
    try {
        const response = await axios.get('http://localhost:5000/products');
        const products = response.data.data;
        console.log('Found', products.length, 'products');

        products.slice(0, 5).forEach(p => {
            console.log(`Product: ${p.name}`);
            console.log(`Images:`, p.images);
            console.log('---');
        });
    } catch (error) {
        console.error('Error fetching products:', error.message);
    }
}

checkProducts();
