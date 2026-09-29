import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogSource = await readFile(path.join(projectRoot, "assets", "catalog.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(catalogSource, context, { timeout: 1000, filename: "assets/catalog.js" });
const products = context.window.RS_CATALOG;
if (!Array.isArray(products) || !products.length) {
  throw new Error("The starting product catalogue could not be loaded.");
}

const quote = value => "'" + String(value).replace(/'/g, "''") + "'";
const statements = products.map((product, position) =>
  "INSERT OR IGNORE INTO products (id, position, data) VALUES (" +
  [quote(product.id), String(position), quote(JSON.stringify(product))].join(", ") +
  ");",
);
const migration = [
  "-- Generated from assets/catalog.js. Keep product changes in the owner dashboard after setup.",
  ...statements,
  "",
].join("\n");

const migrationDirectory = path.join(projectRoot, "migrations");
await mkdir(migrationDirectory, { recursive: true });
await writeFile(path.join(migrationDirectory, "0002_seed_catalog.sql"), migration, "utf8");
console.log("Prepared the initial Cloudflare catalogue with " + products.length +
  " product families and " + products.reduce((sum, product) => sum + product.variants.length, 0) + " variants.");
