import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

export const runtime = 'edge';

const schema = z.object({
    name: z.string(),
    age: z.number(),
})

const app = new Hono().basePath('/api')


app.get('/hello', clerkMiddleware(), (c) => {
    const auth = getAuth(c);

    if(!auth?.userId){
        return c.json({
            success: "NOPE PLIS LOGIN"
        })
    }
    return c.json({
        success: true,
        message: `hello world!`,
    })
})


export const GET = handle(app)
export const POST = handle(app)