require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const emailRouter = require("./routers/emailRouter");
const loginRouter = require("./routers/loginRouter");
const logoutRouter = require("./routers/logoutRouter");
const urlRouter = require("./routers/urlRouter");
const { validateToken } = require("./services/jwtService");

const app = express();
app.set("port", process.env.PORT || 5000);

const corsOption = {
  origin: "http://localhost:5500",
  credentials: true,
};

app
  .use(cookieParser())
  .use(cors(corsOption))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use("/login", loginRouter)
  .get("/", (req, res) => {
    const { jwt } = req.cookies;
    let user = {};
    if (!jwt) {
      res.status(200).send({
        userLoggedIn: false,
      });
    } else {
      try {
        user = validateToken(jwt);
      } catch (e) {
        return res.status(404).send({
          userLoggedIn: true,
        });
      }
      res.status(200).send({
        userLoggedIn: true,
        email: user.username,
      });
    }
  })
  .use("/email", emailRouter)
  .use("/login", loginRouter)
  .use("/logout", logoutRouter)
  .use("/url", urlRouter)
  .listen(app.get("port"));
