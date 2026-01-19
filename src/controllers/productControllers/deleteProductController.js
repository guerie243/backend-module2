const deleteProductService = require('../../services/productServices/deleteProductService');
const { syncDeleteAnnoncesByProduct } = require('../../services/productServices/syncAnnonceService');
const { invalidateProductsCache } = require('../../utils/cache');


const deleteProductController = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteProductService(id);

        // 🔄 Synchronisation avec le Module 1 : Suppression des annonces liées
        const authHeader = req.headers.authorization;
        syncDeleteAnnoncesByProduct(id, authHeader).then(result => {
            if (!result.success) {
                console.warn(`[deleteProduct] Échec synchro Module 1: ${result.error}`);
            }
        });

        // 🔔 Invalidation du cache
        invalidateProductsCache();

        res.status(200).json({ success: true, message: "Produit supprimé avec succès." });

    } catch (error) {
        console.error("Erreur suppression produit:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = deleteProductController;
