import { authRouter } from "./auth-router.js";
import { createRouter, publicQuery } from "./middleware.js";
import { portfolioRouter } from "./portfolio-router.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  portfolio: portfolioRouter,
});

export type AppRouter = typeof appRouter;
