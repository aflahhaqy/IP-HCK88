require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const UserController = require("./controllers/userController");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", UserController.home);
app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.post("/login/google", UserController.googleLogin);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
