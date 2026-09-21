import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(),
  content: text("content").notNull().default("{}"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  service: text("service"),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(contactMessages).omit({ id: true, read: true, createdAt: true });

export const loginLogs = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
  success: boolean("success").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("new"), // e.g. "new", "active", "completed"
  balance: integer("balance").notNull().default(0),
  ordersCompleted: integer("orders_completed").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const timeSessions = pgTable("time_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Untitled Session"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTimeSessionSchema = createInsertSchema(timeSessions).omit({ id: true, createdAt: true });

// --- NEW TABLES FOR CLIENT ACCOUNTS ---

export const creatorCodes = pgTable("creator_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCreatorCodeSchema = createInsertSchema(creatorCodes).omit({ id: true, createdAt: true });

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // "user", "guest"
  avatar: text("avatar"),
  isBanned: boolean("is_banned").notNull().default(false),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const thumbnails = pgTable("thumbnails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  image: text("image").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("in_progress"), // "in_progress", "delivered", "completed"
  price: integer("price").notNull().default(0),
  notes: text("notes"),
  downloadUrl: text("download_url"),
  creatorName: text("creator_name"),
  youtubeUrl: text("youtube_url"),
  views: text("views"),
  videoTitle: text("video_title"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "paid"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  thumbnailId: integer("thumbnail_id").references(() => thumbnails.id).notNull(),
  authorName: text("author_name").notNull(), // To distinguish between Admin and User
  isAdmin: boolean("is_admin").notNull().default(false),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  thumbnailId: integer("thumbnail_id").references(() => thumbnails.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("system"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const revisionRequests = pgTable("revision_requests", {
  id: serial("id").primaryKey(),
  thumbnailId: integer("thumbnail_id").references(() => thumbnails.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  // status: "pending" | "in_progress" | "completed" | "rejected"
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Messaging ───────────────────────────────────────
// One conversation per user (can expand to multi-topic later)
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull().default("General"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  // senderType: "user" | "admin"
  senderType: text("sender_type").notNull().default("user"),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const publicRatings = pgTable("public_ratings", {
  id: serial("id").primaryKey(),
  portfolioItemId: integer("portfolio_item_id").notNull(),
  rating: integer("rating").notNull(),
  visitorId: text("visitor_id").notNull(),
  visitorName: text("visitor_name").notNull().default("Visitor"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Creator-Grouped Public Portfolio ─────────────────
export const portfolioCreators = pgTable("portfolio_creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  subscriberCount: text("subscriber_count"),
  youtubeUrl: text("youtube_url"),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => portfolioCreators.id, { onDelete: "cascade" }).notNull(),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  youtubeUrl: text("youtube_url"),
  views: text("views"),
  category: text("category"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertThumbnailSchema = createInsertSchema(thumbnails).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertPublicRatingSchema = createInsertSchema(publicRatings).omit({ id: true, createdAt: true });
export const insertRevisionRequestSchema = createInsertSchema(revisionRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertPortfolioCreatorSchema = createInsertSchema(portfolioCreators).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({ id: true, createdAt: true, updatedAt: true });

export type PublicRating = typeof publicRatings.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type SiteContent = typeof siteContent.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type LoginLog = typeof loginLogs.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type TimeSession = typeof timeSessions.$inferSelect;

export type User = typeof users.$inferSelect;
export type Thumbnail = typeof thumbnails.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type CreatorCode = typeof creatorCodes.$inferSelect;
export type RevisionRequest = typeof revisionRequests.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type PortfolioCreator = typeof portfolioCreators.$inferSelect;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
