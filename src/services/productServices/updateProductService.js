const ProductModel = require('../../models/productModels');

/**
 * Service pour mettre à jour un produit existant.
 * @param {string} id - L'ID (ou productId) du produit
 * @param {Object} updates - Les champs à mettre à jour
 * @returns {Promise<Object>} Le produit mis à jour
 */
const updateProductService = async (id, updates) => {
    const product = await ProductModel.update(id, updates);
    if (!product) {
        throw new Error("Produit non trouvé ou mise à jour impossible.");
    }
    return product;
};

module.exports = updateProductService;
