import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import type { Db } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Kept on globalThis so every route bundle shares one write queue.
const queueHolder = globalThis as typeof globalThis & {
  __dbWriteQueue?: Promise<unknown>;
};

async function load(): Promise<Db> {
  try {
    return JSON.parse(await readFile(DB_PATH, "utf8")) as Db;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { employees: [], projects: [] };
    }
    throw error;
  }
}

/** Reads fresh data for a request. Call from inside a <Suspense> boundary. */
export async function readDb(): Promise<Db> {
  await connection();
  return load();
}

/** Runs a read-modify-write atomically. Throw from `change` to abort the write. */
export function mutateDb<T>(change: (db: Db) => T): Promise<T> {
  const run = async () => {
    const db = await load();
    const result = change(db);
    await mkdir(path.dirname(DB_PATH), { recursive: true });
    const tempPath = `${DB_PATH}.${process.pid}.tmp`;
    await writeFile(tempPath, JSON.stringify(db, null, 2));
    await rename(tempPath, DB_PATH);
    return result;
  };
  const next = (queueHolder.__dbWriteQueue ?? Promise.resolve()).then(run, run);
  queueHolder.__dbWriteQueue = next.catch(() => undefined);
  return next;
}
