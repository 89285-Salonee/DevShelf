const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Endpoint = require('../models/Endpoint');
const { optionalAuth, protect } = require('../middleware/auth');
const {
  buildReadableFilter,
  canReadDocument,
  canManageDocument,
  buildCollectionPayload,
} = require('../utils/docAccess');

// Public docs stay public. Authenticated users also see their private docs.
router.get('/', optionalAuth, async (req, res) => {
  try {
    const collections = await Collection.find(buildReadableFilter(req)).sort({ createdAt: 1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection || !canReadDocument(collection, req)) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const collection = new Collection(buildCollectionPayload(req, req.body));
    const saved = await collection.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    if (!canManageDocument(collection, req)) {
      return res.status(403).json({ error: 'You can only edit your own collections' });
    }

    Object.assign(collection, buildCollectionPayload(req, req.body, collection));
    const saved = await collection.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    if (!canManageDocument(collection, req)) {
      return res.status(403).json({ error: 'You can only delete your own collections' });
    }

    await Endpoint.deleteMany({ collectionId: req.params.id });
    await collection.deleteOne();
    res.json({ message: 'Collection and its endpoints deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/endpoints', optionalAuth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection || !canReadDocument(collection, req)) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const endpoints = await Endpoint.find({
      collectionId: req.params.id,
      ...buildReadableFilter(req),
    }).sort({ order: 1, createdAt: 1 });

    res.json(endpoints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
