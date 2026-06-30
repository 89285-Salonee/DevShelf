const mongoose = require('mongoose');

const EndpointSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: [true, 'Collection ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Endpoint name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      default: 'GET',
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
    body: {
      type: String, // stored as JSON string
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    scope: {
      type: String,
      enum: ['personal', 'global'],
      default: 'global',
    },
    isAdminOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Transform headers Map → plain object on JSON serialisation
EndpointSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret.headers instanceof Map) {
      ret.headers = Object.fromEntries(ret.headers);
    }
    return ret;
  },
});

module.exports = mongoose.model('Endpoint', EndpointSchema);
