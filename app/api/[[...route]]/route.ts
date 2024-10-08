import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";

import accounts from "@/app/api/[[...route]]/accounts";
import transactions from "@/app/api/[[...route]]/transactions";
import summary from "@/app/api/[[...route]]/summary";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const app = new Hono().basePath("/api");

const routes = app
  .route("/accounts", accounts)
  .route("/transactions", transactions)
  .route("/summary", summary);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
