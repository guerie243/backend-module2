const axios = require('axios');
const config = require('../config/config');

/**
 * Vérifie si une vitrine appartient à un utilisateur en interrogeant le Module 1.
 * @param {string} userId - L'ID de l'utilisateur (issu du token JWT)
 * @param {string} vitrineId - L'ID de la vitrine à vérifier
 * @param {string} authHeader - Le header Authorization pour l'appel au Module 1
 * @returns {Promise<Object>} Les données de la vitrine si autorisée
 * @throws {Error} Si la vitrine n'est pas trouvée ou n'appartient pas à l'utilisateur
 */
const verifyVitrineOwnership = async (userId, vitrineId, authHeader) => {
    try {
        console.log(`[AUTH-CHECK] Vérification propriété vitrine ${vitrineId} pour utilisateur ${userId}`);

        // On récupère les détails de la vitrine auprès du Module 1
        // On utilise l'endpoint public /id/:vitrineId ou on pourrait utiliser /myvitrines
        // Mais /id/:vitrineId est plus direct si on a l'ID.
        const response = await axios.get(`${config.MODULE1_API_URL}/vitrines/id/${vitrineId}`, {
            headers: { 'Authorization': authHeader }
        });

        if (!response.data || !response.data.success || !response.data.vitrine) {
            throw new Error("Vitrine non trouvée.");
        }

        const vitrine = response.data.vitrine;

        // Vérification de la propriété
        if (vitrine.ownerId !== userId) {
            throw new Error("Vous n'êtes pas le propriétaire de cette vitrine.");
        }

        return {
            vitrineId: vitrine.vitrineId,
            vitrineSlug: vitrine.slug,
            vitrineCategory: vitrine.category || vitrine.type || 'general'
        };
    } catch (error) {
        console.error(`[AUTH-CHECK-ERROR] ${error.message}`);
        if (error.response && error.response.status === 404) {
            throw new Error("Vitrine non trouvée sur le serveur principal.");
        }
        throw error;
    }
};

module.exports = { verifyVitrineOwnership };
