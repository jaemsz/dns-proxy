module.exports.Database = function() {
  if (this.constructor === Database) {
    throw new Error("Can't instantiate abstract class!");
  }
}

Database.prototype.connect = function() {
  throw new Error("Abstract method!");
}

Database.prototype.insert = function() {
  throw new Error("Abstract method!");
}

Database.prototype.close = function() {
  throw new Error("Abstract method!");
}
