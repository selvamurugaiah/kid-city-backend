import express from "express";
import { Product } from "../models/Product.js";

const router = express.Router();

router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;

    if (category === "all") {
      const products = await Product.find();

      return res.status(200).send(products);
    } else {
      const products = await Product.find({ category: category });
      return res.status(200).send(products);
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

export default router;
