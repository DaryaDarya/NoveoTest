var express = require("express");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var config = require("./config/config");

var db = require("./utils/dbConnection");
var productsModel = require("./models/products")(db);
var productsController = require("./controllers/products")(productsModel);
var cartController = require("./controllers/cart")(productsModel);


var app = express();
app.use(cookieParser());
app.use(session({secret:"0123456789", resave: true, saveUninitialized: true}));
//todo: use router
app.put("/api/cart/:product_id/:quantity", cartController.add);
app.delete("/api/cart/:product_id", cartController.remove);
app.get("/api/cart", cartController.getAll);
app.get("/api/products", productsController.getAll);



app.use(function(req, res, next){
	res.status(404);
	res.send({"error":{
		"type":"invalid_request_error",
		"message":"Unable to resolve the request "+req.url
		}
	});
	return;
})

app.use(function(err, req, res, next){
	res.status(err.status || 500);
	res.send({"error":{
		"type":"internal_server_error",
		"message":"Something went wrong:" + err.message
		}
	});
	return;
})

app.listen(config.server.port, function(){
    console.log("Express server listening on port", config.server.port);
});