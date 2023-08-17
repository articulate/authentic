export default class IssWhitelistError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IssWhitelistError'
  }
}
