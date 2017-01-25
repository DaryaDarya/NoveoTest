var Promise = require("bluebird");
var mongo = Promise.promisifyAll(require("mongoskin"));
var config = require("../config/config");
var db = mongo.db(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`);

module.exports = db;