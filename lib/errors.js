function IssWhitelistError(message) {
  Error.captureStackTrace(this, this.constructor)
  this.name = 'IssWhitelistError'
  this.message = message
}
IssWhitelistError.prototype = Object.create(Error.prototype)
module.exports.IssWhitelistError = IssWhitelistError
