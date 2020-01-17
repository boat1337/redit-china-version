var sanitizeHtml = require('sanitize-html');
var express = require('express');
var app = express();
const rateLimit = require("express-rate-limit");
 
const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 5
});
 
// only apply to requests that begin with /api/
// UNCOMMENT DURING PRODUCTION
// app.use("/api/v1/posts/new", apiLimiter);
var localDB = {"posts":{
"aBcDefG":{
"author":"domenic",
"content":"Hello world!<br />",
"votes": {"up":3,"down":1},
"title": "Welcome!"
	}
}
}
var userDB = {
"domenic":{
"password": "bees123",
// "upvoted":["aBcDefG"]
"upvoted":[]
}
}
app.use('/', express.static('public'));

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

app.get('/api/v1/db', function (req, res) {
  res.send(localDB);
});
app.get('/api/adm/db', function (req, res) {
  res.send(userDB);
});
app.get('/api/v1/posts/upvote', function (req, res) {
	 let username = req.query.username;
	   let pass = req.query.password
	  if(userDB[username].password == pass){
		  if(!userDB[username].upvoted.includes(req.query.id)){
			  userDB[username].upvoted.push(req.query.id)
  localDB.posts[req.query.id].votes.up += 1
		  }else{
			    localDB.posts[req.query.id].votes.up -= 1
				userDB[username].upvoted = userDB[username].upvoted.filter(e => e !== req.query.id);
		  }
	  }
});
app.get('/api/v1/posts/downvote', function (req, res) {
  localDB.posts[req.query.id].votes.up -= 1
});
app.get('/api/v1/users/register', function (req, res) {
	if( userDB[req.query.username] == undefined){
		userDB[req.query.username] = {}
 userDB[req.query.username].password = req.query.password
 userDB[req.query.username].upvoted = []
	}
});
app.get('/api/v1/users/db', function (req, res) {
  res.send('{"1024x2":{password:"ilovefortnite"}}')
});
app.get('/api/v1/posts/new', function (req, res) {
  let id = makeid(7);
  let username = sanitizeHtml(req.query.username);
  let content = sanitizeHtml(req.query.content);
  let title = sanitizeHtml(req.query.title);
  let pass = req.query.password
  // localhost:8000/api/v1/posts/new?username=domenic&password=bees123&content=API+Test&title=test
  if(userDB[username].password == pass){
	  console.log("auth success")
	  console.log(username,content,title,pass,id)
	  
  localDB.posts[id] = {
	  "author": username,
	  "content": content,
	  "title": title,
	  "votes": {"up":0,"down":0}
  }
  }else{
	  console.log("[AUTH FAIL]")
	console.log(username,content,title,pass,id)
  }
  res.send(localDB);
});
app.listen(8000, function () {
  console.log('Project HTMeet');
  console.log("Running on 0.0.0.0:8000")
});
