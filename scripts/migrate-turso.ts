/**
 * Aplica las migraciones de Drizzle a la base de datos de Turso.
 * Ejecutar una sola vez tras crear la DB en Turso:
 *
 *   npx tsx --tsconfig tsconfig.json scripts/migrate-turso.ts
 *
 * Requiere TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en el entorno.
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ Falta TURSO_DATABASE_URL");
    process.exit(1);
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  console.log("🚀 Aplicando migraciones a Turso...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migraciones aplicadas correctamente.");
  client.close();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
