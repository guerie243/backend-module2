const getOrdersByVitrineService = require('../../services/orderServices/getOrdersByVitrineService');

/**
 * @desc    Get orders by Vitrine ID
 * @route   GET /api/orders/vitrine/:vitrineId
 * @access  Public
 */
const getOrdersByVitrineController = async (req, res) => {
    try {
        const { vitrineId } = req.params;
        const orders = await getOrdersByVitrineService(vitrineId);

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = getOrdersByVitrineController;
