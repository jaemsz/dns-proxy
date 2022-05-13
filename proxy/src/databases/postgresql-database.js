const pg = require("pg");
const { Database } = require("./database");

const PostgresqlDatabase = function() {
  Database.apply(this, arguments);
};

PostgresqlDatabase.prototype = Object.create(Database.prototype);

PostgresqlDatabase.prototype.constructor = this.PostgresqlDatabase;

PostgresqlDatabase.prototype.connect = function(connectionString) {
}

PostgresqlDatabase.prototype.insert = function(request, response) {
}

PostgresqlDatabase.prototype.close = function() {
}

module.exports = {
  PostgresqlDatabase
}