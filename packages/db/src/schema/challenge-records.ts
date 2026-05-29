import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions.js";

export const challengeRecords = pgTable("challenge_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id),
  record: jsonb("record").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
