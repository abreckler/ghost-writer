import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import middleware from './middleware';
const app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.json()).use(helmet()).use(cors());
app.use(express.urlencoded());
app.use(middleware.setAPIVersion);

export default app;
