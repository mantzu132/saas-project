import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";

import accounts from "@/app/api/[[...route]]/accounts";
import { HTTPException } from "hono/http-exception";
import transactions from "@/app/api/[[...route]]/transactions";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const app = new Hono().basePath("/api");

const routes = app
  .route("/accounts", accounts)
  .route("/transactions", transactions);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
