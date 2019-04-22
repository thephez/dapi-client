class HTTPError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} statusMessage
   * @param {Object} requestConfig
   */
  constructor(statusCode, statusMessage, requestConfig) {
    super();

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    this.requestConfig = requestConfig;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = HTTPError;
