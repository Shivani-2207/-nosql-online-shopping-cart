const { Schema, model } = require('mongoose');

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price_cents: Number, // price snapshot at purchase time
        quantity: Number,
      },
    ],
    total_cents: { type: Number, required: true },
    status: { type: String, enum: ['PLACED', 'PAID', 'SHIPPED', 'CANCELLED'], default: 'PLACED' },
    address: { line1: String, city: String, state: String, pincode: String },
  },
  { timestamps: true }
);

module.exports = model('Order', orderSchema);
