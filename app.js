/*
  app.js
  mohan chinnappan
    
  Ref: https://github.com/ccoenraets/salesforce-canvas-demo

  */
var express = require("express"),
  bodyParser = require("body-parser"),
  path = require("path"),
  request = require("request"),
  // CryptoJS = require("crypto-js"),
  decode = require("salesforce-signed-request");
alert('decode:::'+decode);
var app = express();
// make sure to set by:
//  heroku config:set CANVAS_CONSUMER_SECRET=adsfadsfdsfsdafsdfsdf

var consumerSecret = '444EA80829D8DD9C5F3D6F551E2DE4306D25656A7DD9AD0BC41F8E99F5584BE4'; //process.env.CANVAS_CONSUMER_SECRET;

app.use(express.static(path.join(__dirname, "views")));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ entended: true }));
// just a welcome page
app.get("/", function(req, res) {
  res.render("welcome");
});

// SF call POST us on this URI with signed request
app.post("/signedrequest", function(req, res) {
  console.log(req.body.signed_request);

  var signedRequest = decode(req.body.signed_request, consumerSecret),
    context = signedRequest.context,
    oauthToken = signedRequest.client.oauthToken,
    instanceUrl = signedRequest.client.instanceUrl;
  const query = "SELECT Id, FirstName, LastName, Phone, Email FROM Contact";

  contactRequest = {
    url: instanceUrl + "/services/data/v45.0/query?q=" + query,
    headers: {
      Authorization: "OAuth " + oauthToken
    }
  };

  request(contactRequest, function(err, response, body) {
    const contactRecords = JSON.parse(body).records;

    var payload = {
      instanceUrl: instanceUrl,
      headers: {
        Authorization: "OAuth " + oauthToken
      },
      context: context,
      contacts: contactRecords
    };
    res.render("index", { payload: payload });
  });
});


// POST to toolbar URI - make this uri as Canvas App URL in the connected app (AccountPositionApp2) setting 
app.post("/myevents", function(req, res) {
  var signedRequest = decode(req.body.signed_request, consumerSecret);
  res.render("myevents", {signedRequest: signedRequest});
});


var port = process.env.PORT || 9000;
app.listen(port);
console.log("Listening on port " + port);
