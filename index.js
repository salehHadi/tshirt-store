const app = require("./app");
require("dotenv");
const connectweithDb = require("./config/mongoBD");
const cloudinary = require("cloudinary");

// connect with databaise
connectweithDb();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY__NAME,
  api_key: process.env.CLOUDINARY__API_KEY,
  api_secret: process.env.CLOUDINARY__API_SECERET,
  secure: true,
});

app.listen(process.env.PORT, () => {
  console.log(`server is running at ${process.env.PORT} PORT ...`);
});
