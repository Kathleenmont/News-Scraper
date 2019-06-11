const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const exphbs = require("express-handlebars");

// require models
const db = require("./models");

const PORT = 3002;

// express
const app = express();

// middleware

app.use(logger("dev"));
// parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// connect to mongo db
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Handlebars
app.engine(
    "handlebars",
    exphbs({
      defaultLayout: "main"
    })
  );
  app.set("view engine", "handlebars");


app.get("/scrape", function (req, res) {
    // grab html with axios
    axios.get("https://www.nytimes.com/section.world").then(function (response) {
        const $ = cheerio.load(response.data);
        console.log($)

        // grab every h2 within an article tag
        $("div.10wtrbd").each(function (i, element) {
            const result = {};
           console.log("result " + result)
            // result.title = $(this)
            // .children("h2")
            // .text();
            // result.link = $(this).children("a")
            // .attr("href");      result.link = $(element).find("a").attr("href");
            result.link = $(element).find("a").attr("href");
            result.title = $(element).find("h2.e134j7ei0").text().trim();
            result.summary = $(element).find("p.e134j7ei1").text().trim();
            // create a new Article using the result object built from scraping
            db.Article.create(result)
            .then(function (dbArticle) {
                console.log(dbArticle);
            })
            .catch(function (err) {
                console.log(err)
            });
        });
        // send message to client
        res.send("scrape complete")
    });
});

app.get("/articles", function (req, res) {
    // grab every doc in the Articles collection 
    db.Article.find({})
    .then(function (dbArticle) {
        // if find articles send them back to the client
        res.json(dbArticle);
    })
    .catch (function (err) {
        // iff err send to the client
        res.json(err);
    });
});



app.listen(PORT, function () {
    console.log("App running on port " + PORT)
})