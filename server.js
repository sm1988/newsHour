require("dotenv").config();
var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");


// Require all models
var db = require("./models");


var app = express();
var PORT = process.env.PORT || 8000;
app.use(express.static("public"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect("mongodb://newsadmin:newsadmin123@ds047672.mlab.com:47672/heroku_005bdckd", { useNewUrlParser: true });

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
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
  var results=[];
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      //res.render("articles", {news: results});
      dbArticle.forEach(element =>results[element])
      // results.push({
      //   my_title: dbArticle.title,
      //   my_link: dbArticle.link
      // });
      console.log(results);
      res.render("articles", {news: results});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.listen(PORT, function() {
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    PORT,
    PORT
  );
});
