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
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.get("/scrape", function(req, res) {
  // grab html with axios
  axios.get("https://pitchfork.com/").then(function(response) {
    const $ = cheerio.load(response.data);

    console.log(response.data);

    // grab every h2 within an article tag
    $("div.album-details").each(function(i, element) {
      const result = {};
      console.log("result " + result);
      // result.title = $(this)
      // .children("h2")
      // .text();
      // result.link = $(this).children("a")
      // .attr("href");      result.link = $(element).find("a").attr("href");
      result.link = $(element)
        .find("a")
        .attr("href");
      result.artist = $(element)
        .find("ul.artist-list")
        .text();
      result.title = $(element)
        .find("h2.title")
        .text();
      result.summary = $(element)
        .find("div.abstract")
        .text()
        .trim();

      // create a new Article using the result object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    // send message to client
    res.send("scrape complete");
  });
});

app.get("/articles", function(req, res) {
  // grab every doc in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // if find articles send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // iff err send to the client
      res.json(err);
    });
});

app.get("/api/saved", function(req, res) {
    // grab every doc in the Articles collection
    db.Article.find({
        saved: true
      })
      .then(function(dbArticle) {
        // if find articles send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // iff err send to the client
        res.json(err);
      });
  });

app.get("/", function(req, res) {
  db.Article.find({}).then(function(dbArticle) {
    console.log(dbArticle);
    res.render("index", {
      articles: dbArticle
    });
    console.log(dbArticle);
  });
});

// app.get("/saved", function(req, res) {
//     // Go into the mongo collection, and find all docs where "read" is true
//     db.Article.find({ saved: true }, function(error, found) {
//       // Show any errors
//       if (error) {
//         console.log(error);
//       }
//       else {
//         // Otherwise, send the books we found to the browser as a json
//         res.json(found);
//       }
//     });
//   });

//filtered results search
app.get("/saved", function(req, res) {
  db.Article.find({
    saved: true
  }).then(function(dbArticle) {
    console.log(dbArticle);
    res.render("saved", {
      articles: dbArticle
    });
    console.log("HERE" + dbArticle);
  });
});

// put route for devouring a burger

app.put("/api/saved/:id", function(req, res) {
  db.Article.update(
    {
      _id: req.params.id
    },
    {
      $set: {
        saved: true
      }
    },
    function(error, edited) {
      // show any errors
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // Otherwise, send the result of our update to the browser
        console.log(edited);
        res.send(edited);
      }
    }
  );
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
