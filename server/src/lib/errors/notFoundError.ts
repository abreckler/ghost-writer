import BaseError from './baseError';
import { errors } from '../../config/errorMessages';

class NotFoundError extends BaseError {
  info: { id: string; message: string };
  statusCode: number;
  constructor(message?: string) {
    super(message || errors.notFound.message);
    this.info = errors.notFound;
    this.statusCode = 404;
  }
}

export default NotFoundError;
