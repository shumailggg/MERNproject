const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const fileUpload = require("express-fileupload");
const path = require("path");

//Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "server/config/config.env" });
}

const errorMidddleware = require("./middleware/error.js");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload());
app.use(cookieParser());

//Routes importing
const productRouter = require("./routes/productRoute.js");
const userRouter = require("./routes/userRoute.js");
const orderRouter = require("./routes/orderRoute.js");
const paymentRouter = require("./routes/paymentRoute.js");
app.use("/api/v1", productRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", paymentRouter);

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
});

app.get("/", (req, res) => {
  res.send("Welcome to shumail Smasher");
});

//Middlewares for Error
app.use(errorMidddleware);

module.exports = app;
