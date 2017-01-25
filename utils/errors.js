var _ = require("lodash");
module.exports = {
	badContextMessage: badContext,
	notFoundEntityMessage: notFoundEntity
}

function badContext(params){
	return {
		error:{
			params: params,
			type: "invalid_param_error",
			message: "Invalid data parameters"
		}
	}
}

function notFoundEntity(param, entityName){
	return badContext([{name: param, code: "not_exist", message: entityName+" not exist"}])
}