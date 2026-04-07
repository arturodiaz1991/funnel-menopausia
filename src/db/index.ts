import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// TURSO_DATABASE_URL en producción (Turso remoto)
// DATABASE_URL en desarrollo (SQLite local con file:)
const url = process.env.TURSO_DATABASE_URL
  || process.env.DATABASE_URL
  || "file:./db/funnel.db";

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
