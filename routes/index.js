var request = require('request');
var credentials = require("../credentials.json");
var projects = require("../projects.json");
var folders = require("../folders.json");
var Box = require("nodejs-box");
var agent = require('superagent');
/*
 * GET home page.
 */

exports.view = function(req, res){
  	res.render('index', projects);
};

exports.uploadpage = function(req, res){
	//box api call, query the folders and try to get the id val
  	res.render('uploadpage', folders);
};

exports.homepage = function(req, res){
	//box api call, query the folders and try to get the id val
  	res.render('homepage');
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

	           // console.log(token);
	           //....
	           credentials.access_token = token;
	           credentials.expires_in = expires;
	           credentials.restricted_to = restrict;
	           credentials.token_type = token_type;
	           credentials.refresh_token = refresh_token;
	           //update json

	           // console.log(credentials);

	           res.render("homepage")
	        }
	    }
	);
	//exchange the authorization code for an access token from Box.
}

exports.upload = function(req, res){
	var folder_name = req.body.folder_name;
	console.log("folder name", folder_name);


	var token = "Bearer" + " " + credentials.access_token;
	console.log("token --->", token);

	agent
    .post("https://api.box.com/2.0/folders/")
    .set('Authorization', token)
    .send({"name":folder_name, "parent": {"id": "0"}})
    .end(function (result) {
      if (result.error) {
        
      }
	 folders.folders.push({
		"id" : result.body.id,
		"name" : result.body.name,
		"shared_link_gen" : false,
		"link" : ""
	 })

      console.log(result.body);
      res.render("uploadpage", folders);
    });
	// var box = new Box({
	// 	access_token: credentials.access_token,
	// 	refresh_token: credentials.refresh_token
	// })

	// box.folders.create("folder_name", 0, function(result){
	// 	console.log(result);
	// 	folders.folders.push({
	// 		"id" : "result.id",
	// 		"name" : "result.name"
	// 	})
	// 	res.render("uploadpage", folders);
	// })
}

exports.sharedlink = function(req, res){
	var token = "Bearer" + " " + credentials.access_token;
	console.log("token --->", token);
	var id = req.body.id;

	agent
    .put("https://api.box.com/2.0/folders/" + id)
    .set('Authorization', token)
    .send({"shared_link": {"access" : "open"}})
    .end(function (result) {
      if (result.error) {
        
      }
      console.log(result.body);

      for (var i = folders.folders.length - 1; i >= 0; i--) {
      	if(folders.folders[i].id == result.body.id){
      		folders.folders[i].shared_link_gen = true;
      		folders.folders[i].link = result.body.shared_link.url;
      	}
      };

      res.render("uploadpage", folders);
    });

}

/*
*/