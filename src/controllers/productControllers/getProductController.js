const getProductService = require('../../services/productServices/getProductService');
const { ObjectId } = require('mongodb');

const getProductController = async (req, res) => {
    try {
        let { id, slug, vitrineId } = req.params;
        const { page, limit } = req.query;

        // Si slug est présent mais id ne l'est pas, 
        // on considère que slug peut être un ID si on ne trouve rien avec slug plus tard
        // ou on le laisse passer tel quel pour que le service gère le fallback.

        const products = await getProductService({
            id,
            slug,
            vitrineId,
            page,
            limit
        });

        if ((id || slug) && !products) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('[getProductController] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = getProductController;
