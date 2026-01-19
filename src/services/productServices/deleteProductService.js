const ProductModel = require('../../models/productModels');

/**
 * Service pour supprimer un produit.
 * @param {string} id - L'ID (ou productId) du produit
 * @returns {Promise<void>}
 */
const deleteProductService = async (id) => {
    const result = await ProductModel.delete(id);
    if (!result) {
        throw new Error("Produit non trouvé ou suppression impossible.");
    }
};

module.exports = deleteProductService;
