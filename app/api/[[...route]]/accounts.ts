import { Hono } from "hono";
import { db } from "@/db";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { accounts, insertAccountsSchema } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
// API ACCOUNTS POST GET
const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
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
  })
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertAccountsSchema.pick({ name: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "Unauthorized" }, 401),
        });
      }

      const [data] = await db
        .insert(accounts)
        .values({ userId: auth.userId, ...values, id: createId() })
        .returning();

      return c.json({ data });
    },
  );

export default app;
