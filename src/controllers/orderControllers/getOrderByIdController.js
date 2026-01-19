const getOrderByIdService = require('../../services/orderServices/getOrderByIdService');

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Public
 */
const getOrderByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderByIdService(id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = getOrderByIdController;
