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
    res.render("/")
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

//   app.get("/api/notes", function(req, res) {
//     // grab every doc in the Articles collection
//     db.Note.find({})
//       .then(function(dbNotes) {
//         // if find articles send them back to the client
//         res.json(dbNotes);
//       })
//       .catch(function(err) {
//         // iff err send to the client
//         res.json(err);
//       });
//   });

app.get("/", function(req, res) {
  db.Article.find({}).then(function(dbArticle) {
    console.log(dbArticle);
    res.render("index", {
      articles: dbArticle
    });
    console.log(dbArticle);
  });
});



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

// put route for saving an article
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


// // put route for saving a note
// app.put("/api/notes/:id", function(req, res) {
//     db.Note.create(
//       {
//         _id: req.params.id
//       },
//       {
//         $set: {
//           title: req.body.title,
//           body: req.body.body
//         }
//       },
//       function(error, edited) {
//         // show any errors
//         if (error) {
//           console.log(error);
//           res.send(error);
//         } else {
//           // Otherwise, send the result of our update to the browser
//           console.log(edited);
//           res.send(edited);
//         }
//       }
//     );
//   });

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
        console.log("HHHEEERREE DB ARTIVCLEEE  " + dbArticle)
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


    // Route for  deletingan Article's associated Note
app.delete("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.deleteOne( { "_id" : req.params.id } )
     
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
