const axios = require('axios');

const API_URL = 'http://localhost:5000/api/activities';

const activities = [
    {
        eventType: 'LOGIN',
        userName: 'Jean Dupont',
        userId: 'user_001',
        screenName: 'LoginScreen',
        metadata: { method: 'email', device: 'iPhone 13' }
    },
    {
        eventType: 'VIEW_PRODUCT',
        userName: 'Marie Curie',
        userId: 'user_002',
        screenName: 'ProductDetail',
        metadata: { productId: 'prod_99', price: 45.99 }
    },
    {
        eventType: 'ADD_TO_CART',
        userName: 'Jean Dupont',
        userId: 'user_001',
        screenName: 'ProductDetail',
        metadata: { productId: 'prod_99', quantity: 2 }
    },
    {
        eventType: 'PURCHASE',
        userName: 'Jean Dupont',
        userId: 'user_001',
        screenName: 'Checkout',
        metadata: { orderId: 'ord_556', total: 91.98 }
    },
    {
        eventType: 'SEARCH',
        userName: 'Alice Smith',
        userId: 'user_003',
        screenName: 'HomeScreen',
        metadata: { query: 'chaussures de sport' }
    }
];

const seed = async () => {
    console.log('--- Seeding Activities ---');
    for (const activity of activities) {
        try {
            await axios.post(API_URL, activity);
            console.log(`✅ Logged ${activity.eventType}`);
        } catch (error) {
            console.error(`❌ Failed ${activity.eventType}:`, error.message);
        }
    }
    console.log('--- Done Seeding ---');
};

seed();
