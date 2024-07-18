import { Hono } from "hono";
import { db } from "@/db";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { accounts, insertAccountsSchema } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
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
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "Unauthorized" }, 401),
        });
      }

      const { id } = c.req.valid("param");

      const data = await db.query.accounts.findMany({
        where: (accounts, { eq, and }) =>
          and(eq(accounts.id, id), eq(accounts.userId, auth.userId)),
        columns: {
          id: true,
          name: true,
        },
      });

      if (data.length === 0) {
        return c.json({ error: "Not found or unauthorized" }, 404);
      }

      return c.json({ data });
    },
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    clerkMiddleware(),
    zValidator("json", insertAccountsSchema.pick({ name: true })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "Unauthorized" }, 401),
        });
      }

      const { id } = c.req.valid("param");

      if (!id || id === "undefined") {
        throw new HTTPException(400, {
          res: c.json({ error: "Missing ID" }, 400),
        });
      }

      const { name } = c.req.valid("json");

      const data = await db
        .update(accounts)
        .set({ name })
        .where(eq(accounts.id, id))
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Not found or unauthorized" }, 404);
      }

      return c.json({ data });
    },
  )
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
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "Unauthorized" }, 401),
        });
      }

      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, auth.userId),
            inArray(accounts.id, values.ids),
          ),
        )
        .returning({
          id: accounts.id,
        });

      return c.json({ data });
    },
  );

export default app;
