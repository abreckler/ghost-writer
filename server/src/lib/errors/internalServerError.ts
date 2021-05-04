import BaseError from './baseError';
import { errors } from '../../config/errorMessages';

class InternalServerError extends BaseError {
  info: { id: string; message: string };
  statusCode: number;
  constructor(message?: string) {
    super(message || errors.internalServerError.message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
    this.info = errors.internalServerError;
    this.statusCode = 500;
  }
}

export default InternalServerError;
