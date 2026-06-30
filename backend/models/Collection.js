const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    baseUrl: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1', // indigo default
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

module.exports = mongoose.model('Collection', CollectionSchema);
