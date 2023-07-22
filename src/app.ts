import express from 'express';
import cookieParser from 'cookie-parser';
// import helmet from 'helmet';
// import session from 'express-session';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUI from 'swagger-ui-express';
// import RedisStore from 'connect-redis';
// import { createClient } from 'redis';
import compression from 'compression';
import hpp from 'hpp';
import cors from 'cors';
// import mongoSanitize from 'express-mongo-sanitize';
import globalErrorHandler from '@middleware/errorHandler.middleware';
import AppError from '@utils/errors/appError.util';
import APIroutes from './routes';

const app: express.Application = express();

app.enable('trust proxy');

/*
 * -------- CORS -------
 */

app.use(cors());
// Access-Control-Allow-Origin *
// api.nest.com, front-end nest.com
// app.use(cors({
//   origin: 'https://www.nest.com'
// }))

// app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

/*
 * -------- SET SECURITY HTTP HEADERS -------
 */

// app.use(helmet());

/*
 * -------- DEVELOPMENT LOGGING -------
 */
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

/*
 * ----- API THROTTLING -------
 * Limit requests/ Throttling from same IP
 */

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

/*
 * ----- BODY PARSER -------
 * reading data from body into req.body and limiting data size
 */

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

/*
 * ----- SECURITY: PARAMETER POLLUTION -------
 */
app.use(
  hpp({
    whitelist: ['', ''],
  }),
);

app.use(compression());

/*
 * ----- VIEWS  -------
 */
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));
app.set('views', `${__dirname}/views`);

/*
 * ----- SESSION MIDDLEWARE -------
 */

// Initialize client.
// const redisClient = createClient();
// redisClient.connect().catch(console.error);

// Initialize store.
// const sessionStore = new RedisStore({
//   client: redisClient,
//   prefix: 'myapp:',
// });

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || 'secret',
//     resave: false,
//     saveUninitialized: false,
//     store: sessionStore,
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24,
//       // secure: true,
//       httpOnly: true,
//     },
//   }),
// );

/*
 * ----- API ROUTES -------
 */
app.use(
  '/api/v1/docs',
  swaggerUI.serve,
  swaggerUI.setup(undefined, {
    swaggerOptions: {
      url: '/swagger.json',
    },
  }),
);

// move into api/index also find out what an underscore parameter means
app.get('/', (_, res) => res.render('index', { appName: 'Nest' }));

APIroutes(app);

/*
 * ----- GLOBAL ERROR HANDLING -------
 */
app.use((_: express.Request, res: express.Response) => res.render('404', { pageTitle: 'Page Not Found' }));

app.all('*', (req: express.Request, _: express.Response, next: express.NextFunction) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

export default app;
