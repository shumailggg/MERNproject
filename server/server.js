const app = require("./app.js");
const cloudinary = require("cloudinary").v2;

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error ${err.message}`);
  console.log(`Shutting Down Server due to Uncaught Exception`);

  process.exit(1);
});

//Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "server/config/config.env" });
}

//DataBase Connection
require("./config/database.js");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server is runing o port no http://localhost:${process.env.PORT}`
  );
});

//Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error ${err.message}`);
  console.log(`Shutting Down Server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
