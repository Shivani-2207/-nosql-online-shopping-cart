const { Schema, model } = require('mongoose');

module.exports = model(
  'User',
  new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      name: String,
    },
    { timestamps: true }
  )
);
