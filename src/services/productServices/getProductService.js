const ProductModel = require('../../models/productModels');

/**
 * Service pour récupérer des produits selon différents critères.
 * @param {Object} criteria - { id, slug, vitrineId, page, limit }
 * @returns {Promise<Object|Array>} Un produit ou une liste de produits
 */
const getProductService = async ({ id, slug, vitrineId, page = 1, limit = 20 }) => {
    if (id) {
        return await ProductModel.findById(id);
    }
    if (slug) {
        return await ProductModel.findBySlug(slug);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitInt = parseInt(limit);

    if (vitrineId) {
        return await ProductModel.findByVitrineId(vitrineId, skip, limitInt);
    }
    return await ProductModel.findAll(skip, limitInt);
};

module.exports = getProductService;
