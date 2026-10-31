import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { portfolioRouter } from "./portfolio-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  portfolio: portfolioRouter,
});

export type AppRouter = typeof appRouter;
