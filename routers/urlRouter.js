const express = require("express");
const mongo = require("mongodb");
const nanoid = require("nanoid");
const dayjs = require("dayjs");

const urlRouter = express.Router();

const mongoClient = mongo.MongoClient;

const mongoURL = process.env.MONGO_URL;

mongoClient.connect(mongoURL, (err, dbname) => {
  if (err) throw err;

  let db = dbname.db("url-shortener");
  db.collection("urls", (err) => {
    if (err) throw err;
  });

  urlRouter
    .post("/", (req, res) => {
      if (!req.body.url) {
        return res.status(400).send({ response: "Invalid request." });
      } else {
        db.collection("urls").findOne(
          { originalUrl: req.body.url },
          (err, response) => {
            if (response != null) {
              return res.status(200).send({
                response: "Provided URL has already been converted once.",
              });
            } else {
              const id = nanoid.nanoid(15);
              const data = {
                originalUrl: req.body.url,
                shortUrl: id,
                visitCount: 0,
                creationDate: dayjs().format("MM-DD-YYYY"),
                creationTime: dayjs().format("HH:mm:ss"),
              };
              db.collection("urls").insertOne(data, (err) => {
                if (err) throw err;
                res.status(200).send({
                  response: "URL shortened successfully.",
                  shortUri: id,
                });
              });
            }
          }
        );
      }
    })
    .get("/:id", (req, res) => {
      db.collection("urls").findOne(
        { shortUrl: req.params.id },
        (err, response) => {
          if (err) throw err;
          if (response == null) {
            return res.status(404).send({ response: "Entry not found" });
          } else {
            db.collection("urls").updateOne(
              { shortUrl: req.params.id },
              {
                $inc: { visitCount: 1 },
              }
            );
            return res.status(301).redirect("http://" + response.originalUrl);
          }
        }
      );
    })
    .get("/", (req, res) => {
      db.collection("urls")
        .find({})
        .toArray((err, result) => {
          res.status(200).send(result);
        });
    });
});

module.exports = urlRouter;
