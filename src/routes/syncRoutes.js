const express = require('express');
const router = express.Router();
const SyncModel = require('../models/syncModel');

// @route   GET /api/sync/phrase
// @desc    Get the current sync phrase
router.get('/phrase', async (req, res) => {
    try {
        const syncData = await SyncModel.getPhrase();
        if (!syncData) {
            return res.status(404).json({ success: false, message: 'No phrase found' });
        }
        res.json({ success: true, phrase: syncData.phrase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   POST /api/sync/phrase
// @desc    Set a new sync phrase
router.post('/phrase', async (req, res) => {
    try {
        const { phrase } = req.body;
        if (!phrase) {
            return res.status(400).json({ success: false, message: 'Phrase is required' });
        }
        await SyncModel.setPhrase(phrase);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   DELETE /api/sync/phrase
// @desc    Delete the sync phrase
router.delete('/phrase', async (req, res) => {
    try {
        await SyncModel.deletePhrase();
        res.json({ success: true, message: 'Phrase deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
