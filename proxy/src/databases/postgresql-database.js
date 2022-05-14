const { Pool } = require("pg");
const { Database } = require("./database");

let pool = null;

const PostgresqlDatabase = function() {
  Database.apply(this, arguments);
};

PostgresqlDatabase.prototype = Object.create(Database.prototype);

PostgresqlDatabase.prototype.constructor = this.PostgresqlDatabase;

PostgresqlDatabase.prototype.connect = function(connectionString) {
  console.log("Connecting to postgresql");
  pool = new Pool({ connectionString });
}

PostgresqlDatabase.prototype.insert = function(response) {
  console.log("response", response);
}

PostgresqlDatabase.prototype.close = async function() {
  if (pgClient) {
    console.log("Closing postgresql connection");
    await pool.end();
  }
}

module.exports = {
  PostgresqlDatabase
}