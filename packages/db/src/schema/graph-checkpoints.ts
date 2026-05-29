import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions.js";

export const graphCheckpoints = pgTable("graph_checkpoints", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id),
  threadId: text("thread_id").notNull(),
  checkpoint: jsonb("checkpoint").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
