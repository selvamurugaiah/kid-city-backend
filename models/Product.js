import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name can't be empty"],
  },
  description: {
    type: String,
    required: [true, "Product description can't be empty"],
  },
  price: {
    type: String,
    required: [true, "Product price can't be empty"],
  },
  category: {
    type: String,
    required: [true, "Product category can't be empty"],
  },
  images: {
    type: Array,
    required: true,
  },
});

export const Product = mongoose.model("Products", productSchema);
