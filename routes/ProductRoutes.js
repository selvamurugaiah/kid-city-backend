import express from "express";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).send(products);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, images, user_id } = req.body;
    const user = await User.findById({ _id: user_id });

    if (user.isAdmin) {
      const productData = new Product({
        name,
        description,
        price,
        category,
        images,
      });
      productData
        .save()
        .then((response) => res.status(200).send("Product Added successfully"))
        .catch((err) => res.status(400).send("Error while adding"));
    } else {
      return res.status(401).send("You don't have permission");
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await Product.findByIdAndUpdate({ _id: id }, data);
    if (product) {
      res.status(200).send("Product Updated successfully");
    } else {
      throw err;
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete({ _id: id });

    if (product) {
      res.status(200).send({ message: "Product deleted successfully" });
    } else {
      throw err;
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById({ _id: id });
    return res.status(200).send(product);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

export default router;
