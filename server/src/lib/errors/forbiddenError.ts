import BaseError from './baseError';
import { errors } from '../../config/errorMessages';

class ForbiddenError extends BaseError {
  info: { id: string; message: string };
  statusCode: number;
  constructor(message?: string) {
    super(message || errors.forbidden.message);
    this.info = errors.forbidden;
    this.statusCode = 400;
  }
}

export default ForbiddenError;
