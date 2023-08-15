import express from "express";
import { User } from "../models/User.js";
import { Order } from "../models/Orders.js";
import { Cart } from "../models/Cart.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { userId, productId, totalPrice, address, country, cartId } =
      req.body;

    cartId.forEach(async (cartID) => {
      await Cart.findByIdAndDelete({ _id: cartID });
    });

    const user = await User.findOne({ _id: userId });
    const newOrder = new Order({
      products: productId,
      user_id: userId,
      totalPrice,
      address,
      country,
    });
    await newOrder.save();

    user.orders.push(newOrder);

    const notification = {
      status: "unread",
      message: `New order from ${user.name}`,
      time: new Date(),
    };
    io.sockets.emit("new-order", notification);

    await user.save();

    return res.status(201).send({ message: "Order placed successfully" });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { _id: 0, name: 1, email: 1 } }],
        },
      },
    ])
      .exec()
      .then((response) => res.status(200).send(response))
      .catch((err) => res.status(400).send(err));
  } catch (e) {
    res.status(400).json(e.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.find({ _id: id });

    await Order.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { _id: 0, name: 1, email: 1 } }],
        },
      },
    ])
      .exec()
      .then((response) => res.status(200).send(response[0]))
      .catch((err) => res.status(400).send(err));
  } catch (e) {
    res.status(400).json(e.message);
  }
});

router.patch("/mark-shipped/:id", async (req, res) => {
  const io = req.app.get("socketio");
  const { userId } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findById(userId);
    await Order.findByIdAndUpdate(id, { status: "shipped" });
    const notification = {
      status: "unread",
      message: `Order ${id} shipped`,
      time: new Date(),
    };
    io.sockets.emit("notification", notification, userId);
    user.notifications.push(notification);
    await user.save();
    await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { _id: 0, name: 1, email: 1 } }],
        },
      },
    ])
      .exec()
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => res.status(400).send(err));
    // const notification = {status: 'unread', message: `Order ${id} shipped with success`, time: new Date()};
    // io.sockets.emit("notification", notification, ownerId);
    // user.notifications.push(notification);
    // await user.save();
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export default router;
