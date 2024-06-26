import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";

import accounts from "@/app/api/[[...route]]/accounts";
import { HTTPException } from "hono/http-exception";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const app = new Hono().basePath("/api");

const routes = app.route("/accounts", accounts);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
