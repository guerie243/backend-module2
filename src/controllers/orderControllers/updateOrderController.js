const updateOrderService = require('../../services/orderServices/updateOrderService');
const { invalidateOrdersCache } = require('../../utils/cache');
const { notifyWhatsAppOrderStatusUpdated } = require('../../notifications');

/**
 * @desc    Update an existing order
 * @route   PATCH /api/orders/:id
 * @access  Private (JWT)
 */
const updateOrderController = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de commande manquant'
            });
        }

        const result = await updateOrderService(id, updates);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        // 🔔 Notification WhatsApp lors du changement de statut
        if (updates.status) {
            notifyWhatsAppOrderStatusUpdated(result).catch(err => console.error("[NOTIFY] Erreur WhatsApp status update:", err.message));
        }

        // 🔔 Invalidation du cache des ordres
        invalidateOrdersCache();

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = updateOrderController;
