import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    products: {
      type: Array,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "processing",
    },
    totalPrice: {
      type: Number,
    },
    placed_at: {
      type: Date,
      default: Date.now(),
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  { minimize: false }
);

export const Order = mongoose.model("Orders", OrderSchema);
