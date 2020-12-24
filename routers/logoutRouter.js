const express = require("express");
const mongo = require("mongodb");

const logoutRouter = express.Router();

const mongoClient = mongo.MongoClient;

const mongoURL = process.env.MONGO_URL;

mongoClient.connect(mongoURL, (err, dbname) => {
  if (err) throw err;

  let db = dbname.db("url-shortener");
  db.collection("users", (err) => {
    if (err) throw err;
  });

  logoutRouter.get("/", (req, res) => {
    res.clearCookie("jwt");
    res.status(200).send("Logged out");
  });

  //   dbname.close();
});

module.exports = logoutRouter;
