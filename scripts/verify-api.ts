// Local harness that exercises api/index.ts the way Vercel does: import the
// default-exported Express app and hand it to a Node HTTP server. Run with:
//   npx tsx scripts/verify-api.ts
import { createServer } from "http";
import app from "../api/index";

const server = createServer(app);

async function main() {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as { port: number };
  const base = `http://127.0.0.1:${port}`;

  for (const path of [
    "/api/community/visions",
    "/api/company-research",
    "/api/does-not-exist",
  ]) {
    const res = await fetch(base + path);
    const body = await res.text();
    console.log(
      `GET ${path} -> ${res.status} ${res.headers.get("content-type")} :: ${body.slice(0, 120)}`,
    );
  }

  server.close();
}

main().catch((err) => {
  console.error(err);
  server.close();
  process.exit(1);
});
