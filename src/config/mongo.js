const mongoose = require('mongoose');

module.exports = () => mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop');
