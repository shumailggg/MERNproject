const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_URL, {useNewUrlParser:true,useUnifiedTopology:true}, { dbName: "BinYousaf" })
  .then((data) => {
    console.log(`Connection to Database Successfull at ${data.connection.host}`);
  })
 
