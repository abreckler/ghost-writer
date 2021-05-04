import BaseError from './baseError';
import { errors } from '../../config/errorMessages';

class CacheError extends BaseError {
  info: { id: string; message: string };
  statusCode: number;
  constructor(message?: string) {
    super(message || errors.cache.message);
    this.info = errors.cache;
    this.statusCode = 500;
  }
}

export default CacheError;
