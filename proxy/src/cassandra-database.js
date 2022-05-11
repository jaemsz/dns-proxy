const cassandra = require("cassandra-driver");
const database = require("./database");

const CassandraDatabase = function() {
  database.Database.apply(this, arguments);
};

CassandraDatabase.prototype = Object.create(database.Database.prototype);

CassandraDatabase.prototype.constructor = this.CassandraDatabase;

CassandraDatabase.prototype.connect = function(connectionString) {
}

CassandraDatabase.prototype.insert = function(request, response) {
}

CassandraDatabase.prototype.close = function() {
}

module.exports = {
  CassandraDatabase
}