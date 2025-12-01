import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    description: {
      type: String,
      default: 'Handmade flower crochet item',
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
    },
    category: {
      type: String,
      default: 'crochet',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);

