const mongoose = require("mongoose");

const connectweithDb = () => {
  mongoose
    .connect(process.env.BD_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB CONNECTED succefully"))
    .catch((err) => {
      console.log("err DB NOT CONNECTED");
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectweithDb;
