import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 4000;

// Long-running server for local dev only (Vercel uses api/index.ts)
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

export default app;