import cors from "cors";
import express from "express";
import morgan from "morgan";
import passport from "passport";
import path from "path";
import { socket } from "./configs/socket";
import router from "./routes";
var amqp = require("amqplib/callback_api");
/* ENV */
require("dotenv").config();

/* CONSTANT */
const app = express();
const HOST: string = process.env.HOST || "0.0.0.0";
const PORT: number = +(process.env.PORT || 8001);

/* LOGGING */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/* PASSPORT */
require("./middlewares/passport")(passport);

/* MIDDLEWARES */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

/* STATIC */
const staticPath = path.join(__dirname, "public");
app.use("/static", express.static(staticPath));

/* ROUTING */
router(app);

/* CONNECT TO DB */
require("./configs/db")();

/* CONNECT TO RABBITMQ */
require("./configs/rabbitMQ")(amqp);

/* START SERVER */
const server = app.listen(PORT, HOST, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode at http://${HOST}:${PORT}`
  );
});

socket(server);
