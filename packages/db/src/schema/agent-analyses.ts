import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions.js";

export const agentAnalyses = pgTable("agent_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id),
  agentId: text("agent_id").notNull(),
  artifact: jsonb("artifact").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
