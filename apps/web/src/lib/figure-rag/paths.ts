import "server-only";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const STORE_FILE = "store.json";

function resolveDataDir(): string {
  const fromWeb = join(process.cwd(), "..", "..", ".data", "figure-rag");
  const fromRoot = join(process.cwd(), ".data", "figure-rag");
  const pkgPath = join(process.cwd(), "package.json");
  if (existsSync(pkgPath)) {
    try {
      const name = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
      if (name.name === "@fms/web") return fromWeb;
    } catch {
      /* fall through */
    }
  }
  if (existsSync(fromRoot)) return fromRoot;
  return fromWeb;
}

export function getFigureRagDataDir(): string {
  const dir = resolveDataDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getFigureRagStorePath(): string {
  return join(getFigureRagDataDir(), STORE_FILE);
}
