import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Inngest FIRST (no auth here)
app.use("/api/inngest", serve({ client: inngest, functions }));

// Clerk middleware
app.use(clerkMiddleware());

// ✅ User sync route — call this from frontend after login
app.post("/api/auth/sync-user", async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch user data from Clerk API
    const clerkRes = await fetch(
      `https://api.clerk.com/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    const clerkUser = await clerkRes.json();

    // Send event to Inngest → triggers syncUserCreation function
    await inngest.send({
      name: "clerk/user.created",
      data: clerkUser,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is live on vercel no need to worry");
});

// Local dev only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`server running on port: ${PORT}`));
}

export default app;