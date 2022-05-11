const cassandra = require("cassandra-driver");
const { Database } = require("./database");

const CassandraDatabase = function() {
  Database.apply(this, arguments);
};

CassandraDatabase.prototype = Object.create(Database.prototype);

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