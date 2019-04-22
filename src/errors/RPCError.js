class RPCError extends Error {
  /**
   * @param {number} code
   * @param {string} message
   * @param {Object} data
   * @param {Object} requestConfig
   */
  constructor(code, message, data, requestConfig) {
    super();

    this.name = this.constructor.name;
    this.code = code;
    this.message = message;
    this.data = data;
    this.requestConfig = requestConfig;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = RPCError;
