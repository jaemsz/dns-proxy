module.exports.Database = function() {
  if (this.constructor === module.exports.Database) {
    throw new Error("Can't instantiate abstract class!");
  }
}

module.exports.Database.prototype.connect = function() {
  throw new Error("Abstract method!");
}

module.exports.Database.prototype.insert = function() {
  throw new Error("Abstract method!");
}

module.exports.Database.prototype.close = function() {
  throw new Error("Abstract method!");
}
