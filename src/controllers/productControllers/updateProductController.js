const updateProductService = require('../../services/productServices/updateProductService');
const { syncUpdateAnnoncesByProduct } = require('../../services/productServices/syncAnnonceService');
const { invalidateProductsCache } = require('../../utils/cache');

const updateProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "Aucune donnée fournie." });
        }

        // Parse locations if it's a JSON string (from FormData)
        if (updates.locations && typeof updates.locations === 'string') {
            try {
                updates.locations = JSON.parse(updates.locations);
            } catch (e) {
                console.warn('[updateProduct] Failed to parse locations as JSON, using as-is');
            }
        }

        const product = await updateProductService(id, updates);

        // 🔄 Synchronisation des champs spécifiques (prix, catégorie, lieux)
        const fieldsToSync = ['price', 'category', 'locations', 'deliveryFee'];
        const syncData = {};
        let shouldSync = false;

        fieldsToSync.forEach(field => {
            if (updates[field] !== undefined) {
                syncData[field] = updates[field];
                // Mapper 'name' vers 'title' si besoin (mais ici on se concentre sur price/cat/loc)
                shouldSync = true;
            }
        });

        if (shouldSync) {
            const authHeader = req.headers.authorization;
            syncUpdateAnnoncesByProduct(id, syncData, authHeader).then(result => {
                if (!result.success) {
                    console.warn(`[updateProduct] Échec synchro Module 1: ${result.error}`);
                }
            });
        }

        // 🔔 Invalidation du cache
        invalidateProductsCache();

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Erreur mise à jour produit:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = updateProductController;
