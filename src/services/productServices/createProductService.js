const ProductModel = require('../../models/productModels');
const { generateUniqueId, generateUniqueSlug, loopUntilUnique } = require('../../utils/productUtils');

/**
 * Service pour créer un nouveau produit avec ID et slug uniques.
 * @param {Object} productData - Les données du produit à créer
 * @returns {Promise<Object>} Le produit créé
 */
const createProductService = async (productData) => {
    // Génération d'un ID unique (ex: prod_a1b2c3d4)
    const productId = await loopUntilUnique(generateUniqueId, ProductModel.isProductIdUnique);

    // Génération d'un slug unique (ex: chaussures-nike-1a2b)
    const slug = await loopUntilUnique(() => generateUniqueSlug(productData.name), ProductModel.isSlugUnique);

    const fullProduct = {
        ...productData,
        productId,
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    return await ProductModel.create(fullProduct);
};

module.exports = createProductService;
