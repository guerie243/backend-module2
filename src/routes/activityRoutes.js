const express = require('express');
const router = express.Router();
const ActivityModel = require('../models/activityModel');

// @route   POST /api/activities
// @desc    Log a new user activity
// @access  Public (invités welcome)
router.post('/', async (req, res) => {
    try {
        const event = req.body;

        // Enrichir avec l'IP depuis la requête
        // Supporte x-forwarded-for (proxy), x-real-ip (nginx), ou connexion directe
        event.ipAddress = req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            'Unknown';

        // S'assurer qu'il y a un timestamp
        if (!event.timestamp) {
            event.timestamp = new Date().toISOString();
        }

        await ActivityModel.create(event);
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('[Activities] Error saving event:', error);
        // On renvoie 500 mais le frontend ne devrait pas bloquer l'utilisateur
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   GET /api/activities/all
// @desc    Get all activities (Admin)
// @access  Public (pour l'instant, à sécuriser si nécessaire)
router.get('/all', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const skip = parseInt(req.query.skip) || 0;

        const activities = await ActivityModel.findAll(skip, limit);
        const total = await ActivityModel.count();

        res.json({
            success: true,
            count: total,
            limit: limit,
            skip: skip,
            data: activities
        });
    } catch (error) {
        console.error('[Activities] Error fetching events:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   DELETE /api/activities/all
// @desc    Delete all activities
// @access  Public (pour l'instant, à sécuriser si nécessaire)
router.delete('/all', async (req, res) => {
    try {
        await ActivityModel.deleteAll();
        res.json({ success: true, message: 'All activities deleted' });
    } catch (error) {
        console.error('[Activities] Error deleting events:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
