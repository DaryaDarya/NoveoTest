var Promise = require("bluebird");
var model;

module.exports = function(modelEntity){
	model = modelEntity;
	return {
		getAll: getAll
	}
}

function getAll(req, res, next){
	model.getAll()
		.then(list => {
			res.json({
				data: list
			})
		})
		.catch(err => res.status(500).send(err));	
}