import { Hono } from "hono";
import { db } from "@/db";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

import { HTTPException } from "hono/http-exception";

const app = new Hono().get("/", clerkMiddleware(), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    throw new HTTPException(401, {
      res: c.json({ error: "Unauthorized" }, 401),
    });
  }
  const data = await db.query.accounts.findMany({
    where: (accounts, { eq }) => eq(accounts.userId, auth.userId),
    columns: {
      id: true,
      name: true,
    },
  });
  return c.json({ data });
});

export default app;
