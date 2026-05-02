import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Inngest FIRST (no auth here)
app.use("/api/inngest", serve({ client: inngest, functions }));

//  Apply Clerk to everything else
app.use((req, res, next) => {
  if (req.path.startsWith("/api/inngest")) return next();
  return clerkMiddleware()(req, res, next);
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is live");
});

// Local dev only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`server running on port: ${PORT}`));
}

// Vercel handler
export default app;