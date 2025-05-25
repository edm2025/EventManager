import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  primaryKey,
  doublePrecision,
  date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  minPrice: doublePrecision("min_price").notNull(),
  maxPrice: doublePrecision("max_price").notNull(),
  ticketsTotal: integer("tickets_total").notNull(),
  ticketsSold: integer("tickets_sold").notNull().default(0),
  ticketUrl: text("ticket_url").notNull(),
  featured: boolean("featured").notNull().default(false),
  organizerId: varchar("organizer_id").references(() => users.id),
  performers: text("performers").array(),
  tags: text("tags").array(),
  ageRestriction: text("age_restriction"),
  accessibility: text("accessibility"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social Posts table
export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  eventId: integer("event_id").references(() => events.id),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  orderNumber: text("order_number").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  totalPrice: doublePrecision("total_price").notNull(),
});

// Ticket Locations table
export const ticketLocations = pgTable("ticket_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertEventSchema = createInsertSchema(events);
export const insertSocialPostSchema = createInsertSchema(socialPosts);
export const insertTicketSchema = createInsertSchema(tickets);
export const insertTicketLocationSchema = createInsertSchema(ticketLocations);

// Define types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type Event = typeof events.$inferSelect;

export type InsertSocialPost = typeof socialPosts.$inferInsert;
export type SocialPost = typeof socialPosts.$inferSelect & { user: User };

export type InsertTicket = typeof tickets.$inferInsert;
export type Ticket = typeof tickets.$inferSelect & { event: Event };

export type InsertTicketLocation = typeof ticketLocations.$inferInsert;
export type TicketLocation = typeof ticketLocations.$inferSelect;
