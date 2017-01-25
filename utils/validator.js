var _ = require("lodash");
var rules;

module.exports = function(paramsRules){
	rules = paramsRules;
	return {
		findErrors: findErrors
	}
}

function findErrors(params){
	if (!_.size(rules)){
		return null;
	}
	var results = [];
	_.each(params, (value, key) =>{
		if (rules[key] && _.isFunction(rules[key])){
			var validationResult = rules[key](value);
			if (validationResult)
				results.push(validationResult);
		}
	});
	if (results.length){
		return results;
	}	
	return null;		
}