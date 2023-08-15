import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
const router = express.Router();
import { Cart } from "../models/Cart.js";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (user) {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          await User.aggregate([
            {
              $match: { _id: user._id },
            },
            {
              $lookup: {
                from: "carts",
                localField: "_id",
                foreignField: "user_id",
                as: "carts",
              },
            },
          ])
            .exec()
            .then((response) => {
              res.status(200).send(response[0]);
            })
            .catch((err) => res.status(404).send(err));
        } else {
          throw new Error("Invalid credentials");
        }
      });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      const userData = new User({
        name,
        email,
        password: hashedPassword,
      });

      userData
        .save()
        .then((response) => res.status(200).send(response))
        .catch((err) =>
          res.status(404).send("User already exists, Please try logging In")
        );
    });
  } catch (error) {
    res.status(404).send("User already exists, Please try logging In");
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).populate("orders");
    res.json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/update/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  if (user) {
    await User.aggregate([
      {
        $match: { _id: user._id },
      },
      {
        $lookup: {
          from: "carts",
          localField: "_id",
          foreignField: "user_id",
          as: "carts",
        },
      },
    ])
      .exec()
      .then((response) => {
        res.status(200).send(response[0]);
      })
      .catch((err) => res.status(404).send(err));
  } else {
    res.status(404).send();
  }
});

router.post("/add-to-cart", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const cart = await Cart.find({ name: req.body.name });
    const toCheck = cart.some(
      (product) => product.user_id.toString() == user._id.toString()
    );

    if (toCheck) {
      return res.status(200).send({ message: "Item already in Cart" });
    }
    if (user) {
      const cartData = new Cart({
        user_id: user._id,
        name: req.body.name,
        product_id: req.body.productId,
        quantity: req.body.quantity,
        image: req.body.image,
        price: req.body.price,
        status: "Yet to CheckOut",
      });
      await cartData
        .save()
        .then((response) =>
          res
            .status(201)
            .send({ message: "Your order has been added successfully" })
        )
        .catch((err) =>
          res.status(200).send({ message: "Unable to add your order" })
        );
    } else {
      res.status(400).send({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/remove-from-cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await Cart.findByIdAndDelete({ _id: id });
    if (response) {
      res.status(200).send("Product Deleted successfully");
    } else {
      throw err;
    }
  } catch (error) {
    res.status(500).send("Please try again later");
  }
});

router.get("/:id/orders", async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  if (user) {
    await User.aggregate([
      {
        $match: { _id: user._id },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user_id",
          as: "orders",
        },
      },
    ])
      .exec()
      .then((response) => {
        res.status(200).send(response[0]);
      })
      .catch((err) => res.status(404).send(err));
  }
});

router.post("/updateNotifications/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id });

    const notifications = user.notifications.map((notification) => {
      return { ...notification, status: "read" };
    });

    user.notifications = notifications;

    await user.save();

    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

export default router;
