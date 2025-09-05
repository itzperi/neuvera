import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  hashedId: text("hashed_id").notNull(), // SHA-256 hashed identifier for privacy
  privacyConsent: boolean("privacy_consent").default(false).notNull(),
  optedOut: boolean("opted_out").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  aiModel: text("ai_model").default("groq"), // Track which AI model was used
  responseTime: text("response_time"), // Track response generation time
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const trackingEvents = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  pixelId: text("pixel_id").notNull(),
  eventType: text("event_type").notNull(), // 'page_view', 'chat_interaction', 'button_click', etc.
  currentUrl: text("current_url").notNull(),
  referrerUrl: text("referrer_url"),
  userAgent: text("user_agent"),
  hashedUserId: text("hashed_user_id"), // SHA-256 hashed for privacy
  sessionId: text("session_id").notNull(),
  metadata: jsonb("metadata"), // Custom event data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminUserId: text("admin_user_id").notNull(),
  action: text("action").notNull(), // 'view_analytics', 'export_data', 'modify_settings', etc.
  targetResource: text("target_resource"), // What was accessed/modified
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  details: jsonb("details"), // Additional context
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
  privacyConsent: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
  isUser: true,
  aiModel: true,
  responseTime: true,
});

export const insertTrackingEventSchema = createInsertSchema(trackingEvents).pick({
  pixelId: true,
  eventType: true,
  currentUrl: true,
  referrerUrl: true,
  userAgent: true,
  hashedUserId: true,
  sessionId: true,
  metadata: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).pick({
  adminUserId: true,
  action: true,
  targetResource: true,
  ipAddress: true,
  userAgent: true,
  success: true,
  details: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertTrackingEvent = z.infer<typeof insertTrackingEventSchema>;
export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
