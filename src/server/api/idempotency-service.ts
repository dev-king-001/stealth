import { createHash } from "node:crypto";
import type { ApiRepository } from "./repository";
import type { IdempotencyRecord } from "./domain";

export function hashIdempotencyKey(actor: string, rawKey: string): string {
  return createHash("sha256").update(`${actor}:${rawKey}`).digest("hex");
}

export async function acquireIdempotency(
  repository: ApiRepository,
  actor: string,
  rawKey: string,
  leaseMs: number = 30000, // default 30s lease
): Promise<import("./repository").AcquireIdempotencyResult> {
  const keyHash = hashIdempotencyKey(actor, rawKey);
  return repository.acquireIdempotencyRecord(keyHash, leaseMs);
}

export async function recordIdempotency(
  repository: ApiRepository,
  actor: string,
  rawKey: string,
  status: number,
  body: unknown,
): Promise<void> {
  const keyHash = hashIdempotencyKey(actor, rawKey);
  const now = new Date().toISOString();

  // Get the existing record to preserve the original createdAt, or fallback to now
  const existing = await repository.getIdempotencyRecord(keyHash);
  const createdAt = existing ? existing.createdAt : now;

  const record: IdempotencyRecord = {
    state: "completed",
    status,
    body,
    createdAt,
    completedAt: now,
  };
  await repository.setIdempotencyRecord(keyHash, record);
}
