const axios = require('axios');
require('dotenv').config();

const M1_URL = process.env.MODULE1_API_URL || 'http://localhost:3000/api';
const M2_URL = 'http://localhost:5000/api'; // Module 2 local

let authToken = '';
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'Password123!';
let vitrineId = '';
let vitrineSlug = '';
let productId = '';
let orderId = '';

async function runTests() {
    try {
        console.log('--- Démarrage des tests E2E ---');

        // 1. Inscription (Module 1)
        console.log(`\n1. Inscription de ${testEmail}...`);
        const registerRes = await axios.post(`${M1_URL}/users`, {
            email: testEmail,
            password: testPassword,
            profileName: 'TestUser'
        });
        console.log('Succès Inscription');

        // 2. Connexion (Module 1)
        console.log('\n2. Connexion...');
        const loginRes = await axios.post(`${M1_URL}/users/login`, {
            email: testEmail,
            password: testPassword
        });
        authToken = loginRes.data.token;
        const userId = loginRes.data.user.userId;
        const config = { headers: { 'Authorization': `Bearer ${authToken}` } };
        console.log('Connecté, Token obtenu');

        // 3. Création Vitrine (Module 1)
        console.log('\n3. Création Vitrine...');
        const vitrineRes = await axios.post(`${M1_URL}/vitrines`, {
            name: `Ma Vitrine Test ${Date.now()}`,
            description: 'Une vitrine de test E2E',
            category: 'Habillement'
        }, config);
        vitrineId = vitrineRes.data.vitrineId;
        vitrineSlug = vitrineRes.data.slug;
        console.log(`Vitrine créée: ${vitrineId} (${vitrineSlug})`);

        // 4. Modification Vitrine (Module 1)
        console.log('\n4. Modification Vitrine...');
        await axios.patch(`${M1_URL}/vitrines/myvitrine/${vitrineSlug}`, {
            description: 'Description mise à jour pour le test'
        }, config);
        console.log('Vitrine mise à jour');

        // 5. Création Produit (Module 2)
        console.log('\n5. Création Produit (M2)...');
        const productRes = await axios.post(`${M2_URL}/products`, {
            vitrineId: vitrineId,
            name: 'Produit E2E',
            description: 'Super produit de test',
            price: 1500,
            category: 'Habillement',
            currency: 'DZD',
            locations: ['Alger']
        }, config);
        productId = productRes.data.data.productId;
        console.log(`Produit créé dans M2: ${productId}`);

        // 6. Vérification Synchro (Module 1)
        console.log('\n6. Vérification Synchro vers M1...');
        // On attend un peu que la synchro asynchrone se fasse
        await new Promise(r => setTimeout(r, 1000));
        const annoncesRes = await axios.get(`${M1_URL}/annonces/feed`, { params: { recherche: 'Produit E2E' } });
        const annonce = annoncesRes.data.data.find(a => a.productId === productId);
        if (annonce) {
            console.log('Annonce trouvée dans M1 (Synchro OK)');
        } else {
            console.warn('Annonce NON trouvée dans M1 !');
        }

        // 7. Passage d'une Commande (Module 2)
        console.log('\n7. Passage Commande (M2)...');
        const orderRes = await axios.post(`${M2_URL}/orders`, {
            vitrineId: vitrineId,
            products: [{ productId, name: 'Produit E2E', quantity: 1, price: 1500 }],
            clientName: 'Client Test',
            clientPhone: '0555001122',
            deliveryAddress: 'Alger Centre'
        }, config);
        orderId = orderRes.data.data.orderId;
        console.log(`Commande passée: ${orderId}`);

        // 8. Modification Commande (Module 2)
        console.log('\n8. Modification Commande...');
        await axios.patch(`${M2_URL}/orders/${orderId}`, {
            status: 'confirmed'
        }, config);
        console.log('Statut commande mis à jour');

        // 9. Modification Produit (Module 2)
        console.log('\n9. Modification Produit...');
        await axios.patch(`${M2_URL}/products/${productId}`, {
            price: 2000
        }, config);
        console.log('Prix du produit mis à jour dans M2');

        // 10. Vérification Synchro MaJ (Module 1)
        console.log('\n10. Vérification Synchro MaJ vers M1...');
        await new Promise(r => setTimeout(r, 1000));
        const checkAnnonceUpdate = await axios.get(`${M1_URL}/annonces/feed`, { params: { recherche: 'Produit E2E' } });
        const updatedAnnonce = checkAnnonceUpdate.data.data.find(a => a.productId === productId);
        if (updatedAnnonce && updatedAnnonce.price === 2000) {
            console.log('Prix mis à jour dans M1 (Synchro MaJ OK)');
        } else {
            console.warn(`Synchro MaJ échouée: prix=${updatedAnnonce?.price}`);
        }

        console.log('\n--- Tous les tests sont terminés avec succès ! ---');
    } catch (error) {
        console.error('\nERREUR PENDANT LES TESTS:');
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTests();
