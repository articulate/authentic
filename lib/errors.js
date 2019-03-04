function IssWhitelistError(message, params) {
  Error.captureStackTrace(this, this.constructor)
  this.name = 'IssWhitelistError'
  this.message = message
  if (params) this.params = params
}
IssWhitelistError.prototype = Object.create(Error.prototype)
module.exports.IssWhitelistError = IssWhitelistError
