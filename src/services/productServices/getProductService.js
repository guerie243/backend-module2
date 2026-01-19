const ProductModel = require('../../models/productModels');

/**
 * Service pour récupérer des produits selon différents critères.
 * @param {Object} criteria - { id, slug, vitrineId }
 * @returns {Promise<Object|Array>} Un produit ou une liste de produits
 */
const getProductService = async ({ id, slug, vitrineId }) => {
    if (id) {
        return await ProductModel.findById(id);
    }
    if (slug) {
        return await ProductModel.findBySlug(slug);
    }
    if (vitrineId) {
        return await ProductModel.findByVitrineId(vitrineId);
    }
    return await ProductModel.findAll();
};

module.exports = getProductService;
