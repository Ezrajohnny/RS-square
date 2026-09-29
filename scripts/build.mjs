import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(projectRoot, "dist");
if (!output.startsWith(projectRoot + path.sep)) {
  throw new Error("The website output folder must stay inside the project.");
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of ["index.html", "supplements.html", "admin-login.html", "admin.html"]) {
  await cp(path.join(projectRoot, file), path.join(output, file));
}

await cp(path.join(projectRoot, "assets"), path.join(output, "assets"), {
  recursive: true,
  filter(source) {
    return !source.split(path.sep).includes("uploads");
  },
});

await cp(path.join(projectRoot, "pages", "_routes.json"), path.join(output, "_routes.json"));
