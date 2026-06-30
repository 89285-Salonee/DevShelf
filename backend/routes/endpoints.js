const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Endpoint = require('../models/Endpoint');
const { optionalAuth, protect } = require('../middleware/auth');
const {
  buildReadableFilter,
  canReadDocument,
  canManageDocument,
  buildEndpointPayload,
} = require('../utils/docAccess');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const readableCollections = await Collection.find(buildReadableFilter(req)).select('_id');
    const collectionIds = readableCollections.map((collection) => collection._id);

    const endpoints = await Endpoint.find({
      collectionId: { $in: collectionIds },
      ...buildReadableFilter(req),
    }).sort({ createdAt: 1 });

    res.json(endpoints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint || !canReadDocument(endpoint, req)) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    const collection = await Collection.findById(endpoint.collectionId);
    if (!collection || !canReadDocument(collection, req)) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    res.json(endpoint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { collectionId, name, url } = req.body;

    if (!collectionId || !name || !url) {
      return res.status(400).json({ error: 'collectionId, name, and url are required' });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    if (!canManageDocument(collection, req)) {
      return res.status(403).json({ error: 'You can only add endpoints to your own collections' });
    }

    const endpoint = new Endpoint(buildEndpointPayload(req, req.body, collection));
    const saved = await endpoint.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint) return res.status(404).json({ error: 'Endpoint not found' });

    const collection = await Collection.findById(endpoint.collectionId);
    if (!canManageDocument(endpoint, req) && !canManageDocument(collection, req)) {
      return res.status(403).json({ error: 'You can only edit your own endpoints' });
    }

    Object.assign(endpoint, buildEndpointPayload(req, req.body, collection, endpoint));
    const saved = await endpoint.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint) return res.status(404).json({ error: 'Endpoint not found' });

    const collection = await Collection.findById(endpoint.collectionId);
    if (!canManageDocument(endpoint, req) && !canManageDocument(collection, req)) {
      return res.status(403).json({ error: 'You can only delete your own endpoints' });
    }

    await endpoint.deleteOne();
    res.json({ message: 'Endpoint deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
