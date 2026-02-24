const OrderModel = require('../../models/orderModels');
const { invalidateOrdersCache } = require('../../utils/cache');

/**
 * @desc    Delete an order
 * @route   DELETE /api/orders/:id
 * @access  Private (JWT)
 */
const deleteOrderController = async (req, res) => {
    try {
        const orderId = req.params.id;

        // On vérifie d'abord si la commande existe
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        // TODO: Vérifier que l'utilisateur est bien le propriétaire de la vitrine
        // Pour l'instant on fait confiance au middleware d'authentification

        const result = await OrderModel.delete(orderId);

        if (result.deletedCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Échec de la suppression de la commande'
            });
        }

        // Invalider le cache car les données ont changé
        invalidateOrdersCache();

        res.status(200).json({
            success: true,
            message: 'Commande supprimée avec succès'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

module.exports = deleteOrderController;
