const createProductService = require('../../services/productServices/createProductService');
const { syncAnnonceService } = require('../../services/productServices/syncAnnonceService');
const { invalidateProductsCache } = require('../../utils/cache');

const createProductController = async (req, res) => {
    try {
        // Validation des données primaires
        const { vitrineId, name, description, price, category, slug, currency, deliveryFee, locations } = req.body;

        // Gestion des images (gérée par l'intercepteur)
        const images = req.body.images || [];

        // Parse locations if it's a JSON string (from FormData)
        let parsedLocations = locations;
        if (typeof locations === 'string') {
            try {
                parsedLocations = JSON.parse(locations);
            } catch (e) {
                console.warn('[createProduct] Failed to parse locations as JSON, using as-is');
            }
        }

        console.log(`[createProduct] Tentative création pour vitrine: ${vitrineId}, nom: ${name}, catégorie: ${category}`);

        if (!vitrineId) {
            return res.status(400).json({ success: false, message: "L'ID de la vitrine est requis pour créer un produit." });
        }
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Le nom du produit est obligatoire." });
        }

        console.log(`[createProduct] Données finales avant service:`, {
            vitrineId,
            name,
            price,
            imagesCount: images.length,
            imagesSample: images
        });

        // Appel du service
        const product = await createProductService({
            vitrineId,
            name,
            description,
            price: parseFloat(price),
            category,
            images,
            slug,
            currency,
            deliveryFee: deliveryFee ? parseFloat(deliveryFee) : null,
            locations: parsedLocations || undefined
        }, req.user?.userId, req.headers.authorization);

        console.log(`[createProduct] Produit créé avec succès, ID: ${product._id || product.id}`);

        // 🔄 Synchronisation vers le Module 1 (Annonces)
        // On ne bloque pas la réponse si la synchro échoue, mais on log l'erreur.
        const authHeader = req.headers.authorization;
        syncAnnonceService(product, authHeader).then(syncResult => {
            if (!syncResult.success) {
                console.warn(`[createProduct] Échec de la synchronisation auto: ${syncResult.error}`);
            }
        });

        // 🔔 Invalidation du cache
        invalidateProductsCache();

        // Succès
        return res.status(201).json({
            success: true,
            data: product,
            warning: req.imageWarning || null
        });
    } catch (error) {
        console.error("Erreur lors de la création du produit:", error.message, error.stack);

        // Gestion des erreurs métier
        if (error.message.includes('propriété') || error.message.includes('trouver')) {
            return res.status(403).json({ success: false, message: error.message });
        }

        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = createProductController;
