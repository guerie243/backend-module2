const crypto = require('crypto');

/**
 * Génère un ID de produit aléatoire.
 */
const generateUniqueProductId = () => {
    return `prod_${crypto.randomBytes(4).toString('hex')}`; // ex: prod_a1b2c3d4
};

/**
 * Génère un slug à partir du nom.
 */
const generateUniqueProductSlug = (name = '') => {
    let base = String(name || '')
        .trim()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // supprimer accents
        .replace(/[^a-z0-9]+/g, '-') // remplacer non alphanum par '-'
        .replace(/^-+|-+$/g, '');

    if (!base) base = 'produit';

    const suffix = crypto.randomBytes(2).toString('hex'); // 4 hex chars
    return `${base}-${suffix}`; // ex: chaussures-nike-1a2b
};

/**
 * Fonction helper pour générer de manière asynchrone jusqu'à ce que ce soit unique
 */
const loopUntilUnique = async (generator, checkFn, maxAttempts = 5) => {
    let attempts = 0;
    while (attempts < maxAttempts) {
        const value = await generator();
        const isUnique = await checkFn(value);
        if (isUnique) return value;
        attempts++;
    }
    // Si après maxAttempts ce n'est toujours pas unique, on ajoute un suffixe supplémentaire
    return `${await generator()}-${crypto.randomBytes(2).toString('hex')}`;
};

module.exports = {
    generateUniqueId: generateUniqueProductId,
    generateUniqueSlug: generateUniqueProductSlug,
    loopUntilUnique
};
