require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  const docs = await Product.insertMany([
    { sku: 'TSHIRT-001', name: 'Cotton T-Shirt', description: 'Soft cotton tee', price_cents: 59900, stock: 100, category: 'apparel' },
    { sku: 'MUG-001', name: 'Ceramic Mug', description: '350ml mug', price_cents: 24900, stock: 50, category: 'home' },
    { sku: 'BOOK-001', name: 'NoSQL Distilled', description: 'Intro to NoSQL', price_cents: 89900, stock: 20, category: 'books' },
    { sku: 'HEADPH-001', name: 'Wireless Headphones', description: 'Bluetooth 5.3', price_cents: 349900, stock: 10, category: 'electronics' },
  ]);
  console.log('Seeded products:');
  docs.forEach((d) => console.log(d._id.toString(), d.name));
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
