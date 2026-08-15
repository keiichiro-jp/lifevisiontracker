import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "../server/routes";

// Vercel serverless entrypoint.
//
// Vercel invokes the default export as a Node request handler, so this module
// must never call server.listen() — the platform owns the listener. Static
// assets are served by the CDN from dist/public (see vercel.json), so no Vite
// middleware or express.static is wired up here; this function only answers
// the /api/* routes that vercel.json rewrites to it.

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

registerRoutes(app);

// Unmatched /api paths should stay JSON rather than falling through to
// Express's default HTML 404 page.
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Unhandled error:", err);
  // Unlike the local entrypoint this must not rethrow: an uncaught exception
  // would tear down the serverless invocation instead of returning a response.
  res.status(status).json({ message });
});

export default app;
