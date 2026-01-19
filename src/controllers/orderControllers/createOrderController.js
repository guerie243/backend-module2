const createOrderService = require('../../services/orderServices/createOrderService');
const { notifyOrderCreated, notifyWhatsAppOrderCreated } = require('../../notifications');
const { invalidateOrdersCache } = require('../../utils/cache');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Public
 */
const createOrderController = async (req, res) => {
    try {
        const { vitrineId, products, clientName, clientPhone, deliveryAddress } = req.body;

        // Validation basique des champs obligatoires
        if (!vitrineId || !products || !Array.isArray(products) || products.length === 0 || !clientName || !clientPhone || !deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir vitrineId, products (non vide), clientName, clientPhone et deliveryAddress'
            });
        }

        // Appel au service pour créer la commande avec un ID unique
        const result = await createOrderService(req.body);

        // 🔔 Envoi de la notification sans bloquer la réponse
        // La notification sera envoyée après récupération de l'ownerId via vitrineId
        if (result && result.vitrineId) {
            notifyOrderCreated(result).catch(err => console.error("[NOTIFY] Erreur asynchrone (Firebase/WebPush):", err.message));
            notifyWhatsAppOrderCreated(result).catch(err => console.error("[NOTIFY] Erreur asynchrone (WhatsApp):", err.message));
        }

        // 🔔 Invalidation du cache des ordres
        invalidateOrdersCache();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: result
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = createOrderController;
