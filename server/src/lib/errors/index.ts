import BaseError from './baseError';
import InternalServerError from './internalServerError';
import APIInvalidHeader from './apiDocsError';
import NotFoundError from './notFoundError';
import ForbiddenError from './forbiddenError';
import APIDocs from './apiDocsError';
import CacheError from "./CacheError";

export default {
  APIDocs,
  APIInvalidHeader,
  BaseError,
  CacheError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
};
