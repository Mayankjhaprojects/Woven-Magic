import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../utils/db.js';
import Product from '../models/Product.js';

const products = [
  {
    name: 'Peony Puff Keychain',
    price: 249,
    description: 'Handmade flower crochet keychain — cute & cozy',
    images: ['Image1.jpeg', 'Image1.jpeg'],
    category: 'accessories',
    inStock: true,
  },
  {
    name: 'Rosy Blossom Coaster (Set of 4)',
    price: 499,
    description: 'Handmade flower crochet coaster set — cute & cozy',
    images: ['Image2.jpeg', 'Image2.jpeg'],
    category: 'home',
    inStock: true,
  },
  {
    name: 'Sunflower Headband',
    price: 349,
    description: 'Handmade flower crochet headband — cute & cozy',
    images: ['Image3.jpeg', 'Image3.jpeg'],
    category: 'accessories',
    inStock: true,
  },
  {
    name: 'Lavender Dream Pouch',
    price: 399,
    description: 'Handmade flower crochet pouch — cute & cozy',
    images: ['Image4.jpeg', 'Image4.jpeg'],
    category: 'accessories',
    inStock: true,
  },
  {
    name: 'Blossom Baby Booties',
    price: 599,
    description: 'Handmade flower crochet baby booties — cute & cozy',
    images: ['Image5.jpeg', 'Image5.jpeg'],
    category: 'baby',
    inStock: true,
  },
  {
    name: 'Daisy Hanging Mobile',
    price: 799,
    description: 'Handmade flower crochet hanging mobile — cute & cozy',
    images: ['Image6.jpeg', 'Image6.jpeg'],
    category: 'home',
    inStock: true,
  },
];

const seedProducts = async () => {
  try {
    console.log('🌱 Starting to seed products...');
    await connectDB();
    console.log('🗑️  Clearing existing products...');
    const deleteResult = await Product.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing products`);
    
    console.log('📦 Inserting new products...');
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products:`);
    
    insertedProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ₹${product.price} (${product.images.length} images)`);
    });
    
    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();

