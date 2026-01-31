const getProductService = require('../../services/productServices/getProductService');

const getProductController = async (req, res) => {
    try {
        const { id, slug, vitrineId } = req.params;
        const { page, limit } = req.query;

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

        // Si c'est un produit unique, on le renvoie tel quel dans 'data'
        // Si c'est une liste, elle est déjà dans 'products'
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('[getProductController] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = getProductController;
