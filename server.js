require("dotenv").config();
var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const Handlebars = require('handlebars')


// Require all models
var db = require("./models");


var app = express();
var PORT = process.env.PORT || 8000;
app.use(express.static("public"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect("mongodb://newsadmin:newsadmin123@ds047672.mlab.com:47672/heroku_005bdckd", { useNewUrlParser: true });

app.engine('handlebars', exphbs({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Routes
app.get("/", function(req, res) {
  res.render("index");
});

app.get("/scrape", function (req, res) {
  axios.get("https://www.nytimes.com").then(function (response) {

    var $ = cheerio.load(response.data);

    $("article").each(function (i, element) {
      var result = {};
      result.title = $(this).children().text();
      result.link = $(this).find("a").attr("href");

    // Create a new Article using the `result` object built from scraping
    db.Article.create(result)
      .then(function(dbArticle) {
        // View the added result in the console
        console.log(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });

    });
    res.send("Scrape Complete");
    res.redirect("/articles");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      res.render("articles", {news: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all saved Articles from the db
app.get("/saved", function(req, res) {
  // Grab every document in the Articles collection
  db.Saved.find({})
    .then(function(dbArticle) {
      res.render("save", {news: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// API Route tosaved Articles into the db
app.get("/api/save/:id", function(req, res) {
  // Grab every document in the Articles collection
  $("article").each(function (i, element) {
    var result = {};
    result.title = $(this).children().text();
    result.link = $(this).find("a").attr("href");

  db.Saved.create(result)
      .then(function(dbArticle) {
        // View the added result in the console
        console.log(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
      res.redirect("/saved");
    });
});

app.listen(PORT, function() {
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    PORT,
    PORT
  );
});
