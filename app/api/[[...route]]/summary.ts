import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { differenceInDays, parse, subDays } from "date-fns";
import { accounts, transactions } from "@/db/schema";
import { and, eq, sql, sum, gte, lte, desc } from "drizzle-orm";
import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";

const app = new Hono().get(
  "/",
  clerkMiddleware(),
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    }),
  ),
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

    const startDate = from
      ? parse(from, "yyyy-MM-dd", new Date())
      : defaultFrom;

    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

    const periodLength = differenceInDays(startDate, endDate);
    const lastPeriodStart = subDays(startDate, -periodLength);
    const lastPeriodEnd = subDays(endDate, -periodLength);

    console.log(periodLength, ":periodLength");

    console.log(lastPeriodStart, "lastPeriodStart");
    console.log(lastPeriodEnd, "lastPeriodEnd");

    const fetchFinancialData = async (
      userId: string,
      startDate: Date,
      endDate: Date,
    ) => {
      // @ts-ignore
      return db
        .select({
          income: sql`SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END)`,
          expenses: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`,
          balance: sum(transactions.amount).mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            eq(accounts.userId, userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        );
    };

    const [currentPeriod] = await fetchFinancialData(
      auth.userId,
      startDate,
      endDate,
    );

    const [lastPeriod] = await fetchFinancialData(
      auth.userId,
      lastPeriodStart,
      lastPeriodEnd,
    );

    const incomeChange = calculatePercentageChange(
      currentPeriod.income,
      lastPeriod.income,
    );

    const expensesChange = calculatePercentageChange(
      currentPeriod.expenses,
      lastPeriod.expenses,
    );

    const balanceChange = calculatePercentageChange(
      currentPeriod.balance,
      lastPeriod.balance,
    );

    const activeDays = await db
      .select({
        date: transactions.date,
        income:
          sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
            Number,
          ),
        expenses:
          sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
            Number,
          ),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          eq(accounts.userId, auth.userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
        ),
      )
      .groupBy(transactions.date)
      .orderBy(desc(transactions.date));

    const allDays = fillMissingDays(activeDays, startDate, endDate);

    return c.json({
      currentPeriod,
      lastPeriod,
      incomeChange,
      expensesChange,
      balanceChange,
      allDays,
    });
  },
);

export default app;
