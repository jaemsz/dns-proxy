const cassandra = require("cassandra-driver");
const database = require("./database");

module.exports.CassandraDatabase = function() {
  database.Database.apply(this, arguments);
};

module.exports.CassandraDatabase.prototype = Object.create(database.Database.prototype);

module.exports.CassandraDatabase.prototype.constructor = this.CassandraDatabase;

module.exports.CassandraDatabase.prototype.connect = function(connectionString) {
}

module.exports.CassandraDatabase.prototype.insert = function(request, response) {
}

module.exports.CassandraDatabase.prototype.close = function() {
}