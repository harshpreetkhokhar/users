// const tracer = require('dd-trace').init({ 
//     dbmPropagationMode: 'full' ,
//     env: 'none',
//     service: 'users',
//     version: '1.0.3',
//     source: 'nodejs',
//     runtimeMetrics: true,
//     logInjection: true,
//     hostname: 'datadog-agent',
//     port: 8126
//   });

// const express = require('express');
// const helmet = require("helmet");
// const port = process.env.PORT || 8000;
// const dotenv = require('dotenv').config();
// const cors = require('cors');
// const sequelize = require('./config');
// const { createLogger, format, transports } = require('winston');

// const formats = require('dd-trace/ext/formats');

// class Logger {
//     log(level, message) {
//         const span = tracer.scope().active();
//         const time = new Date().toISOString();
//         const record = { time, level, message };

//         if (span) {
//             tracer.inject(span.context(), formats.LOG, record);
//         }

//         console.log(JSON.stringify(record));
//     }
// }

// module.exports = Logger;

// // import routes
// const authRoutes = require('./routes/auth');
// const refreshTokenRoutes = require('./routes/refreshToken');

// // create an express app
// const app = express();
// app.use(helmet());   // helmet in our express framework and hide away sensitive information. like (X-Powered-By: Express).

// app.use(cors());

// //set custom headers
// app.use(function (req, res, next) {
//     res.setHeader(
//         "Access-Control-Allow-Headers", ["newrelic", "traceparent", "tracestate"]
//     );
//     return next();
// });

// sequelize.sync()
//     .then(() => console.log('Connected to the database!'))
//     .catch((error) => console.error('Error connecting to the database:', error));

// app.use(express.json());
// app.use('/api/v1', authRoutes);
// app.use('/api/v1', refreshTokenRoutes);



// const logger = createLogger({
//     level: 'info',
//     exitOnError: false,
//     format: format.json(),
//     transports: [
//       new transports.File({ filename: `datadog.log` }),
//     ],
//   });
//   // app.use((req, res, next) => {
//   //   const traceId = tracer.getTracer().getCurrentSpan().context().toTraceId();
//   //   logger.info('Incoming request', { trace_id: tracer.trace_id , span_id: tracer.span_id});
//   //   next();
//   // });

//   // Example logs
//   logger.log('info', 'Hello from user!');
//   logger.info('Hello from user',{color: 'blue' });

// // listen to the port 
// app.listen(port, (error) => {
//     if (error) {
//         console.log(`Problem in running the server, ${error}`)
//     }

//     console.log(`Server is listening on port : ${port}`)
// })


const tracer = require('dd-trace').init({ 
  dbmPropagationMode: 'full',
  profiling: true,
  env: 'none',
  service: 'nodejs',
  version: '1.0.3',
  runtimeMetrics: true,
  logInjection: true,
  hostname: 'datadog-agent',
  port: 8126,
});

const express = require('express');
const helmet = require("helmet");
const port = process.env.PORT || 8000;
const dotenv = require('dotenv').config();
const cors = require('cors');
const sequelize = require('./config');
const { createLogger, format, transports } = require('winston');
const { LOG } = require('dd-trace/ext/formats'); // Import the correct format for Datadog

// Configure Winston logger to include Datadog trace information


const withErrorField = format((info) => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            error: {
                kind: info.name,
                message: info.message,
                stack: info.stack,
            }
        });
    }

    return info;
});

const logger = createLogger({
  level: 'info',
  exitOnError: false,
  format: format.combine(
    format.timestamp(),
  format.json(),
    format((info) => {
      const span = tracer.scope().active(); // Get the active span
      if (span) {
        tracer.inject(span.context(), LOG, info); // Inject trace context into log
      }
      return info;
    })()
  ),
  transports: [
    new transports.File({ filename: 'datadog.log' }),
    new transports.Console() // Optionally, you can also log to the console
  ],
});

// // Middleware to log requests with trace information
const requestLogger = (req, res, next) => {
  const span = tracer.scope().active(); // Get the current span
  const traceId = span ? span.context().toTraceId() : 'no-trace-id';

  logger.info('Incoming request', {
    trace_id: traceId,
    method: req.method,
    url: req.url
  });
next();
};

// Create an express app
const app = express();
app.use(helmet()); // Helmet to secure HTTP headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Use the request logger middleware
//app.use(requestLogger);

// Set custom headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", ["newrelic", "traceparent", "tracestate"]);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const refreshTokenRoutes = require('./routes/refreshToken');

// Sync database
sequelize.sync()
  .then(() => console.log('Connected to the database!'))
  .catch((error) => console.error('Error connecting to the database:', error));

// Use routes
app.use('/api/v1', authRoutes);
app.use('/api/v1', refreshTokenRoutes);

// Example logs
logger.info('Hello from user!', { color: 'blue' });

// Start server
app.listen(port, (error) => {
  if (error) {
    console.log(`Problem in running the server, ${error}`);
  }
  console.log(`Server is listening on port : ${port}`);
});
module.exports = logger;
