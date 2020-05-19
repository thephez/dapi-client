class RPCError extends Error {
  /**
   * @param {string} message
   * @param {object} [data]
   */
  constructor(message, data = undefined) {
    super();

    this.message = message;
    this.data = data;
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get error data
   *
   * @returns {object}
   */
  getData() {
    return this.data;
  }
}

module.exports = RPCError;
