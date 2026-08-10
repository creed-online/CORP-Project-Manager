import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApiResponse } from './utils/api-response.js';

dotenv.config();

const app = express();

// ======================
// MIDDLEWARES
// ======================

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Static files
app.use(express.static('public'));

//cookie parser
app.use(cookieParser());

// import the routes
import healthCheckRouter from './routes/healthCheck.routes.js';
import authRouter from './routes/auth.routes.js';

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

// ======================
// TEST ROUTE (optional)
// ======================
app.get('/', (req, res) => {
  res.send('API is running...');
});


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json(
    new ApiResponse(statusCode, null, message)
  );
});

// ======================
// EXPORT
// ======================
export default app;