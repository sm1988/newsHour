var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");


module.exports = function (app) {
//load home page
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
      db.article.create(result)
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
      res.redirect("/news");
    });
  });

  // Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

  app.get("/save", function (req, res) {
    $.ajax({
      type: "GET",
      url: "/api/save"
    }).then(function (response) {
    })
  });
}