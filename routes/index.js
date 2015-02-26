var request = require('request');
var credentials = require("../credentials.json");
var projects = require("../projects.json");
var Box = require("nodejs-box");
/*
 * GET home page.
 */

exports.view = function(req, res){
  	res.render('index', projects);
};

exports.uploadpage = function(req, res){
	//box api call, query the folders and try to get the id val
  	res.render('uploadpage');
};

exports.box_confirm = function(req, res){
	var state = req.query.state;
	var code = req.query.code;

	request.post(
	    'https://app.box.com/api/oauth2/token',
	    { 
	    	form: {
	        'grant_type': 'authorization_code',
	        'code': code,
	        "client_id" : "naun3qp90dnkza4sgnysm4vw3i11qfdl",
	        'client_secret' : "mWIrlALSQvBuXTdkMNSoOEDqeJdGGJbd"
		  }
	    },
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
	        	console.log(body);
	        	// 
	           var body_obj = JSON.parse(body);
	           var token = body_obj["access_token"];
	           var expires = body_obj["expires_in"];
	           var restrict = body_obj["restricted_to"];
	           var token_type = body_obj["token_type"];
	           var refresh_token = body_obj["refresh_token"];

	           console.log(token);
	           //....
	           credentials.access_token = token;
	           credentials.expires_in = expires;
	           credentials.restricted_to = restrict;
	           credentials.token_type = token_type;
	           credentials.refresh_token = refresh_token;
	           //update json

	           console.log(credentials);

	           res.render("homepage")
	        }
	    }
	);
	//exchange the authorization code for an access token from Box.
}

exports.upload = function(req, res){
	var token = credentials.token_type + " " + credentials.access_token;
	console.log("token --->", token);
	var box = new Box({
		access_token: credentials.access_token,
		refresh_token: credentials.refresh_token
	})

	box.folders.create("test file 10", 0, function(result){
		res.send("test file 10");
	})
}

exports.sharedlink = function(req, res){
	var token = credentials.token_type + " " + credentials.access_token;
	console.log("token --->", token);
	var box = new Box({
		access_token: credentials.access_token,
		refresh_token: credentials.refresh_token
	})

	box.folders.createSharedLink("test file 9", "open", function(result){
		res.send("create link");
	})
}