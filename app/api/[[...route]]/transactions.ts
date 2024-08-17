import { Hono } from "hono";
import { db } from "@/db";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import {
  transactions,
  insertTransactionsSchema,
  categories,
  accounts,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { and, eq, inArray, gte, lte, desc, sql } from "drizzle-orm";
import { parse, subDays } from "date-fns";
// API TRANSACTIONS
const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      }),
    ),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);

      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "Unauthorized" }, 401),
        });
      }

      const { from, to, accountId } = c.req.valid("query");

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;

      const data = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          account: accounts.name,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        )
        .orderBy(desc(transactions.date));

      return c.json({ data });
    },
  )
  // TODO:  FIXING THIS
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

      const data = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
        .orderBy(desc(transactions.date));

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
    zValidator("json", insertTransactionsSchema.omit({ id: true })),
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

      const values = c.req.valid("json");

      const transactionToUpdate = db.$with("transaction_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(eq(transactions.id, id), eq(accounts.userId, auth.userId)),
          ),
      );

      const [data] = await db
        .with(transactionToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionToUpdate})`,
          ),
        )
        .returning({
          id: transactions.id,
        });

      if (!data) {
        return c.json({ error: "Not found or unauthorized" }, 404);
      }

      return c.json({ data });
    },
  )
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator("json", z.array(insertTransactionsSchema.omit({ id: true }))),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "Unauthorized" }, 401),
        });
      }

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          })),
        )
        .returning();

      return c.json({ data });
    },
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertTransactionsSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "Unauthorized" }, 401),
        });
      }

      const [data] = await db
        .insert(transactions)
        .values({ ...values, id: createId() })
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

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(accounts.userId, auth.userId),
            ),
          ),
      );

      const data = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`,
          ),
        )
        .returning({
          id: transactions.id,
        });

      return c.json({ data });
    },
  );

export default app;
