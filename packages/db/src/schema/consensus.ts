import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions.js";

export const consensus = pgTable("consensus", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id),
  draft: jsonb("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
