import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  name: String,
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
  },
  quantity: Number,
  image: String,
  description: String,
  price: Number,
  status: String,
  added_at: {
    type: Date,
    default: Date.now(),
  },
});

export const Cart = mongoose.model("Cart", cartSchema);
