const { Client } = require("pg");
const { Database } = require("./database");

let pgClient;

const PostgresqlDatabase = function() {
  Database.apply(this, arguments);
};

PostgresqlDatabase.prototype = Object.create(Database.prototype);

PostgresqlDatabase.prototype.constructor = this.PostgresqlDatabase;

PostgresqlDatabase.prototype.connect = function(connectionString) {
  pgClient = new Client({ connectionString });
  // pgClient.connect()
}

PostgresqlDatabase.prototype.insert = function(request, response) {

}

PostgresqlDatabase.prototype.close = function() {
  if (pgClient) {
    console.log("Closing postgresql connection");
    pgClient.close();
  }
}

module.exports = {
  PostgresqlDatabase
}