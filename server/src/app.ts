import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import middleware from './middleware';

dotenv.config();

const corsOptions: cors.CorsOptions = {
  origin: '*'
};

const app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.json()).use(helmet()).use(cors(corsOptions));
app.use(express.urlencoded());
app.use(middleware.setAPIVersion);

export default app;
