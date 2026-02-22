import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import resumeRouter from './routes/resumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';

const app = express();

const PORT = process.env.PORT || 3000;

// Database Connection
await connectDB();



app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debugging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} - Content-Type: ${req.headers['content-type']}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/users", userRouter)
app.use("/api/resumes", resumeRouter)
app.use("/api/ai", aiRouter)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
