class BaseError extends Error {
  info: any;
  statusCode: number | undefined;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BaseError.prototype);
    this.name = this.constructor.name;
    this.message = message;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, () => this.constructor.name);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export default BaseError;
