const axios = require('axios');
const config = require('../../config/config');

/**
 * Service gérant la synchronisation entre Module 2 et Module 1 (Annonces).
 */

/**
 * 🆕 Crée une annonce dans Module 1 suite à l'ajout d'un produit dans Module 2.
 * @param {Object} product - Le produit créé dans M2
 * @param {string} authHeader - Le token d'authentification pour M1
 */
async function syncAnnonceService(product, authHeader) {
    try {
        console.log(`[SYNC] Création de l'annonce pour le produit: ${product.productId}`);

        // Mapping Product (M2) -> Annonce (M1)
        const annonceData = {
            productId: product.productId,
            vitrineId: product.vitrineId,
            title: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            images: product.images,
            locations: product.locations || [],
            currency: product.currency || 'XOF'
        };

        const response = await axios.post(`${config.MODULE1_API_URL}/annonces`, annonceData, {
            headers: { 'Authorization': authHeader }
        });

        return { success: true, data: response.data };
    } catch (err) {
        console.error(`[SYNC-ERROR] Échec création annonce: ${err.message}`);
        return { success: false, error: err.message };
    }
}

/**
 * 🔄 Met à jour les annonces liées à un produit dans Module 1.
 * @param {string} productId - L'ID du produit M2
 * @param {Object} updates - Les champs mis à jour
 * @param {string} authHeader - Le token d'authentification
 */
async function syncUpdateAnnoncesByProduct(productId, updates, authHeader) {
    try {
        console.log(`[SYNC] Mise à jour des annonces pour le produit: ${productId}`);

        // On mappe optionnellement 'name' vers 'title' si présent dans updates
        const mappedUpdates = { ...updates };
        if (updates.name) mappedUpdates.title = updates.name;

        const response = await axios.patch(
            `${config.MODULE1_API_URL}/annonces/by-product/${productId}`,
            mappedUpdates,
            { headers: { 'Authorization': authHeader } }
        );

        return { success: true, data: response.data };
    } catch (err) {
        console.error(`[SYNC-ERROR] Échec mise à jour annonces: ${err.message}`);
        return { success: false, error: err.message };
    }
}

/**
 * 🗑️ Supprime les annonces liées à un produit dans Module 1.
 * @param {string} productId - L'ID du produit M2
 * @param {string} authHeader - Le token d'authentification
 */
async function syncDeleteAnnoncesByProduct(productId, authHeader) {
    try {
        console.log(`[SYNC] Suppression des annonces pour le produit: ${productId}`);

        const response = await axios.delete(
            `${config.MODULE1_API_URL}/annonces/by-product/${productId}`,
            { headers: { 'Authorization': authHeader } }
        );

        return { success: true, data: response.data };
    } catch (err) {
        console.error(`[SYNC-ERROR] Échec suppression annonces: ${err.message}`);
        return { success: false, error: err.message };
    }
}

module.exports = {
    syncAnnonceService,
    syncUpdateAnnoncesByProduct,
    syncDeleteAnnoncesByProduct
};
