const express = require("express");
const mongo = require("mongodb");
const { validateHash } = require("../services/hashingService");
const { createToken } = require("../services/jwtService");

const loginRouter = express.Router();

const mongoClient = mongo.MongoClient;

const mongoURL = process.env.MONGO_URL;

mongoClient.connect(mongoURL, (err, dbname) => {
  if (err) throw err;

  let db = dbname.db("url-shortener");
  db.collection("users", (err) => {
    if (err) throw err;
  });

  loginRouter.post("/", (req, res) => {
    db.collection("users").findOne(
      { email: req.body.email },
      (err, response) => {
        if (res == null) {
          res.status(404).send("User not found.");
        } else {
          validateHash(req.body.password, response.password).then((result) => {
            if (result) {
              const token = createToken(req.body.email);
              res.cookie("jwt", token, {
                maxAge: 100000000,
                httpOnly: true,
                secure: false,
              });
              res.status(200).send("User logged in.");
            } else {
              res.status(404).send("Invalid user.");
            }
            return result;
          });
        }
      }
    );
  });

  //   dbname.close();
});

module.exports = loginRouter;
