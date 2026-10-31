import { serve } from "@hono/node-server";
import app from "./app.js";
import { serveStaticFiles } from "./lib/vite.js";
import { log } from "./lib/logger.js";

serveStaticFiles(app);

const port = parseInt(process.env.PORT || "3000");
serve({ fetch: app.fetch, port }, () => {
  log.info(`Server running on http://localhost:${port}/`);
});
