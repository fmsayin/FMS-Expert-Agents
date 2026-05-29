/** Session CRUD repository (stub). */
export interface SessionRepository {
  create(userId: string, topic: string): Promise<{ id: string }>;
  findById(id: string): Promise<{ id: string; topic: string } | null>;
}

export function createSessionRepository(): SessionRepository {
  return {
    async create(_userId, topic) {
      return { id: "stub-session-id", topic };
    },
    async findById(id) {
      return { id, topic: "stub" };
    },
  };
}
