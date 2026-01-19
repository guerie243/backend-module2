const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const imageUploadInterceptor = require('../middleware/imageUploadInterceptor');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// Controllers
const getProductController = require('../controllers/productControllers/getProductController');
const createProductController = require('../controllers/productControllers/createProductController');
const updateProductController = require('../controllers/productControllers/updateProductController');
const deleteProductController = require('../controllers/productControllers/deleteProductController');

// Routes
router.get('/', cacheMiddleware, getProductController);
router.get('/vitrine/:vitrineId', cacheMiddleware, getProductController);
router.get('/:slug', cacheMiddleware, getProductController);

// Authenticated routes
router.post('/', authMiddleware, uploadMiddleware.array('images', 10), imageUploadInterceptor('products'), createProductController);
router.patch('/:id', authMiddleware, uploadMiddleware.array('images', 10), imageUploadInterceptor('products'), updateProductController);
router.delete('/:id', authMiddleware, deleteProductController);

module.exports = router;
