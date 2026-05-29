import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions.js";

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id),
  sprr: jsonb("sprr").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
