import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import facilitiesRouter from "./routes/facilities";
import triageRouter from "./routes/triage";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend cross-origin sharing
app.use(cors());

// Enable request body parsing
app.use(express.json());

// Register API v2 Routers
app.use("/api/v2/resources", facilitiesRouter);
app.use("/api/v2/triage", triageRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "MediConnect API Core",
    version: "2.0.0",
    uptime: process.uptime()
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Resource '${req.originalUrl}' not found`
  });
});

// Global central error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("💥 Server Exception:", err);
  res.status(500).json({
    status: "error",
    message: err.message || "An unexpected central error occurred on the API server"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MediConnect API Server running on port ${PORT}`);
  console.log(`📡 Diagnostic Health check: http://localhost:${PORT}/health`);
});
