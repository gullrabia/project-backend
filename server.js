import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

//  Fixed: correct param order, single braces
app.get("/", (req, res) => {
  res.send("server is live");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

// Fixed: only listen locally, NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`server running on port: ${PORT}`));
}

//This export is what Vercel actually uses
export default app;