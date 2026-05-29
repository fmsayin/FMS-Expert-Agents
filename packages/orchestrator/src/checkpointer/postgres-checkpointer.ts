/**
 * Stub checkpointer compatible with LangGraph BaseCheckpointSaver interface.
 * Full implementation: @langchain/langgraph-checkpoint-postgres + DATABASE_URL.
 */
export interface CheckpointSaverStub {
  get(config: { configurable: { thread_id: string } }): Promise<unknown | null>;
  put(
    config: { configurable: { thread_id: string } },
    checkpoint: unknown,
  ): Promise<void>;
  list?(config: { configurable: { thread_id: string } }): Promise<unknown[]>;
}

export function createPostgresCheckpointerStub(): CheckpointSaverStub {
  return {
    async get() {
      return null;
    },
    async put() {
      /* stub — wire PostgresSaver.fromConnString(process.env.DATABASE_URL!) */
    },
    async list() {
      return [];
    },
  };
}

/** @deprecated Use createPostgresCheckpointerStub until Postgres saver is wired. */
export const createPostgresCheckpointer = createPostgresCheckpointerStub;
