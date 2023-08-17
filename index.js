import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import userRoutes from "./routes/UserRoute.js";
import productRoutes from "./routes/ProductRoutes.js";
import imageRoutes from "./routes/ImageRoute.js";
import categoryRoutes from "./routes/CategoryRoute.js";
import orderRoutes from "./routes/OrderRoute.js";

const app = express();

const server = http.createServer(app);
const PORT = process.env.PORT;

const io = new Server(server, {
  cors: "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
});


const URL = process.env.MONGO_URL;
mongoose.connect(URL, { useNewUrlparser: true })
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", userRoutes);
app.use("/product", productRoutes);
app.use("/images", imageRoutes);
app.use("/products", categoryRoutes);
app.use("/orders", orderRoutes);

server.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});

app.set("socketio", io);

