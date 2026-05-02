import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ id: "project-management" });

/* =========================
   CREATE USER
========================= */
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    event: "clerk/user.created",
  },
  async ({ event }) => {
    const { data } = event;

    // ✅ Check if user already exists to avoid duplicate error
    const existingUser = await prisma.user.findUnique({
      where: { id: data.id },
    });

    if (existingUser) {
      return { message: "User already exists, skipping." };
    }

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses?.[0]?.email_address || "",
        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
        image: data?.image_url || "",
      },
    });

    return { message: "User created successfully" };
  }
);

/* =========================
   DELETE USER
========================= */
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    event: "clerk/user.deleted",
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: { id: data.id },
    });

    return { message: "User deleted successfully" };
  }
);

/* =========================
   UPDATE USER
========================= */
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    event: "clerk/user.updated",
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data?.email_addresses?.[0]?.email_address || "",
        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
        image: data?.image_url || "",
      },
    });

    return { message: "User updated successfully" };
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];