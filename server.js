var database_url = "mongodb+srv://useful-Programmer-Practice:orenex0523059741@usefulprogrammerpractic.dqpj4.mongodb.net/orenabarbanel?retryWrites=true&w=majority"
// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortid = require('shortid');
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
// mongoose.connect(process.env.DB_URI);
mongoose.connect(database_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/requestHeaderParserMicroservice", function (req, res) {
  res.sendFile(__dirname + '/views/RequestHeaderParserMicroservice.html');
});

app.get("/URLShortenerMicroservice", function(req, res){
  res.sendFile(__dirname + '/views/URLShortenerMicroservice.html')
})


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  console.log({greeting: 'hello API'});
  res.json({greeting: 'hello API'});
});
// Timestamp Project
app.get("/api/timestamp", function(req, res){
  var now = new Date()
  res.json({
    "unix": now.getTime(),
    "utc": now.toUTCString()
  })
});

app.get("/api/timestamp/:data_string", function(req, res){
  var dateString = req.params.data_string;
  // console.log(dateString);
  // console.log(passedInt(dateString)/*dateString before paseedInValue*/, typeof dateString, Object.keys(dateString));
  
  if(parseInt(dateString) > 10000){
    var unixTime = new Date(parseInt(dateString));
    res.json({
      "unix": unixTime.getTime(),
      "utc": unixTime.toUTCString()
    })
  }

  var passedInValue = new Date(dateString);

  // console.log(typeof passedInValue, "<= passed in value");
  if(passedInValue == "Invalid Date"){
    res.json({"error" : "Invalid Date" });
  }
  else{
    res.json({
      "unix": passedInValue.getTime(),
      "utc": passedInValue.toUTCString()
    })
  }
  // {"unix": <date.getTime()>, "utc" : <date.toUTCString()> }
  // res.json({"error" : "Invalid Date" }); //before "if and else" ^^
  
});
// Header Request
app.get("/api/whoami", function(req, res){
  res.json({
    // "value": Object.keys(req),
    "ipaddress": req.connection.remoteAddress,
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"],
    // "req-header": req.headers
  });
});

// URL Shortening Service

// Build a schema and model to store saved URLs
var ShortURL = mongoose.model('ShortURL', new mongoose.Schema({ 
  short_url: String,
  orignal_url: String,
  suffix: String 
}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// POST /api/users gets JSON bodies
/*app.post('/api/users', function (req, res) {
  // create user in req.body
})*/
// var jsonParser = bodyParser.json() // no longer use this

app.post("/api/shorturl/new/", function(req, res){
  
  var clinet_requested_url = req.body.url;
  var suffix = shortid.generate();
  var newShortURL = suffix;
  // console.log(suffix, "<= clinet_requested_url"); 
  // console.log("post request called");
  // console.log(req.body.url, "< = req.params");
  var newURL = new ShortURL({
    "short_url": __dirname + "/api/shorturl/" + suffix,
    "orignal_url": clinet_requested_url,
    "suffix": suffix
  })

  newURL.save(function(err, doc) {
    if (err) return console.error(err);
    console.log("Document inserted succussfully!", newURL);
    res.json({
      "saved": true,
      "short-url": newURL.short_url,
      "orignal_url": newURL.orignal_url,
      "suffix": newURL.suffix
    });
  })
})

app.get("/api/shorturl/:suffix", function(req, res){
  // console.log(req.params.suffix, "<= req.params.suffix")
  // var userGeneratedShortlink = req.params.suffix; //before change
  var userGeneratedSuffix = req.params.suffix;
  /*var userRequsetedUrl =*/ 
  ShortURL.find({suffix: userGeneratedSuffix}).then(function(foundUrls){
    var urlForReadirect = foundUrls[0];
    // console.log(urlForReadirect, "<= urlForReadirect")
    res.redirect(urlForReadirect.orignal_url)
  })/*, function (err, doc) {*/
    // if(err) return console.log(err);
    // return doc
    // });
  /*******  res.json({
    // "suffix": req.params.suffix
    "userGeneratedSuffix": userGeneratedSuffix,
    "userRequsetedUrl": userRequsetedUrl
  // res.redirect("http://example.com")
    // docs.forEach
  });   ******/
    // console.log(userRequsetedUrl, "<= userRequsetedUrl")
})

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
