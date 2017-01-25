var Promise = require("bluebird");
var db;

module.exports = function(dbConnection){
	db = dbConnection;
	return {
		getAll: getAll,
		get: get
	}
}


function getAll() {
	return db.collection("Products")
		.find()
		.toArrayAsync();
}

function get(id){
	return db.collection("Products")
		.findByIdAsync(id);
}



