import app from './app';
import { pingzRouter } from './services/pingz/pingz.router';
import { apiDocsRouter } from './services/apiDocs/apiDocs.router';
import { openaiRouter } from './services/openai/openai.router';
import { rapidapiRouter } from './services/rapidapi/rapidapi.router';
import { articleGeneratorRouter } from './services/article-generator/article-generator.router';
import { articleRewriterRouter } from './services/article-rewriter/article-rewriter.router';
import { Request, Response, NextFunction } from 'express';
import middleware from './middleware';
import errors from './lib/errors';

// Routers
app
  .use('/pingz', pingzRouter)
  .use('/openai', openaiRouter)
  .use('/rapidapi', rapidapiRouter)
  .use('/api', articleGeneratorRouter)
  .use('/api', articleRewriterRouter)
  .use('/api-docs', apiDocsRouter);

// Catch all and error handling
app
  .use('*', (req: Request, res: Response, next: NextFunction) => {
    next(new errors.NotFoundError('Not found'));
  })
  .use(middleware.errorHandler);

const server = app.listen(app.get('port'), () => {
  console.group();
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.groupEnd();
});

export default server;
