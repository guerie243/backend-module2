const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// Controllers
const createOrderController = require('../controllers/orderControllers/createOrderController');
const updateOrderController = require('../controllers/orderControllers/updateOrderController');
const getOrderByIdController = require('../controllers/orderControllers/getOrderByIdController');
const getOrdersByVitrineController = require('../controllers/orderControllers/getOrdersByVitrineController');
const deleteOrderController = require('../controllers/orderControllers/deleteOrderController');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public
router.post('/', createOrderController);

// @route   PATCH /api/orders/:id
// @desc    Update an existing order
// @access  Private (JWT)
router.patch('/:id', authMiddleware, updateOrderController);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public
router.get('/:id', cacheMiddleware, getOrderByIdController);

// @route   GET /api/orders/vitrine/:vitrineId
// @desc    Get orders by Vitrine ID
// @access  Public
router.get('/vitrine/:vitrineId', cacheMiddleware, getOrdersByVitrineController);

// @route   DELETE /api/orders/:id
// @desc    Delete an existing order
// @access  Private (JWT)
router.delete('/:id', authMiddleware, deleteOrderController);

module.exports = router;
