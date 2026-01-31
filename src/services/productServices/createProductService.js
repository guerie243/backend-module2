const ProductModel = require('../../models/productModels');
const { generateUniqueId, generateUniqueSlug, loopUntilUnique } = require('../../utils/productUtils');
const { verifyVitrineOwnership } = require('../../utils/vitrineCheckUtils');

/**
 * Service pour créer un nouveau produit avec ID et slug uniques.
 * @param {Object} productData - Les données du produit à créer
 * @param {string} userId - ID de l'utilisateur
 * @param {string} authHeader - Token d'autorisation
 * @returns {Promise<Object>} Le produit créé
 */
const createProductService = async (productData, userId, authHeader) => {
    // 🔒 Vérification propriété vitrine
    const { vitrineId, vitrineCategory } = await verifyVitrineOwnership(userId, productData.vitrineId, authHeader);

    // Génération d'un ID unique (ex: prod_a1b2c3d4)
    const productId = await loopUntilUnique(generateUniqueId, ProductModel.isProductIdUnique);

    // Génération d'un slug unique (ex: chaussures-nike-1a2b)
    const slug = await loopUntilUnique(() => generateUniqueSlug(productData.name), ProductModel.isSlugUnique);

    const fullProduct = {
        ...productData,
        vitrineId, // On s'assure d'utiliser l'ID vérifié
        productId,
        slug,
        category: productData.category || vitrineCategory || 'general',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    return await ProductModel.create(fullProduct);
};

module.exports = createProductService;
