import express from 'express';
import versionRouter from '../../lib/versionRouter';
import middleware from '../../middleware';
import * as Note from './note.controller';

export const noteRouter = express.Router();

const allMap = new Map().set('apple', Note.fetchAll).set('orange', Note.fetchAFew);
noteRouter.get('/all', middleware.authentication, middleware.authorization('a role ALL'), middleware.Cache, versionRouter(allMap));

const getMap = new Map().set('apple', Note.fetchById).set('orange', Note.fetchById);
const deleteMap = new Map().set('apple', Note.deleteById).set('orange', Note.deleteById);
const putMap = new Map().set('apple', Note.updateNote).set('orange', Note.updateNote);

noteRouter
  .route('/:id')
  .get(middleware.authentication, middleware.authorization('a role GET / HEAD'), middleware.Cache, versionRouter(getMap))
  .delete(middleware.authentication, middleware.authorization('a role DELETE'), versionRouter(deleteMap))
  .put(middleware.authentication, middleware.authorization('a role PUT'), versionRouter(putMap));
