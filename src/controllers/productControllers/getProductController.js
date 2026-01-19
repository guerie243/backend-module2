const getProductService = require('../../services/productServices/getProductService');

const getProductController = async (req, res) => {
    try {
        const { id, slug, vitrineId } = req.params;
        const products = await getProductService({ id, slug, vitrineId });

        if ((id || slug) && !products) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = getProductController;
