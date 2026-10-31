const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: 'text' },
    description: String,
    price_cents: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, index: true },
    images: [String],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Product', productSchema);
