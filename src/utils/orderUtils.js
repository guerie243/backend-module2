const crypto = require('crypto');

/**
 * Génère un ID de commande aléatoire.
 */
const generateUniqueOrderId = () => {
    return `ord_${crypto.randomBytes(4).toString('hex')}`; // ex: ord_a1b2c3d4
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
    generateUniqueOrderId,
    loopUntilUnique
};
