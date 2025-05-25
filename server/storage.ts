import {
  users,
  events,
  socialPosts,
  tickets,
  ticketLocations,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type SocialPost,
  type InsertSocialPost,
  type Ticket,
  type TicketLocation,
  type InsertTicketLocation
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, lt, gte, or, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Events operations
  getEvents(options: {
    query?: string;
    category?: string;
    date?: string;
    location?: string;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ events: Event[]; total: number; totalPages: number; perPage: number }>;
  getFeaturedEvents(): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Social posts operations
  getSocialPosts(options: {
    query?: string;
    eventId?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ posts: SocialPost[]; total: number; totalPages: number; perPage: number }>;
  getRecentSocialPosts(): Promise<SocialPost[]>;
  getSocialPostsByEvent(eventId: number): Promise<SocialPost[]>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  
  // Tickets operations
  getUserTickets(userId: string): Promise<Ticket[]>;
  
  // Ticket locations operations
  getTicketLocations(): Promise<TicketLocation[]>;
  createTicketLocation(location: InsertTicketLocation): Promise<TicketLocation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Events operations
  async getEvents(options: {
    query?: string;
    category?: string;
    date?: string;
    location?: string;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ events: Event[]; total: number; totalPages: number; perPage: number }> {
    const {
      query,
      category,
      date,
      location,
      maxPrice,
      page = 1,
      limit = 12
    } = options;
    
    // Build where conditions
    let whereConditions = [] as any[];
    
    if (query) {
      whereConditions.push(or(
        like(events.title, `%${query}%`),
        like(events.description, `%${query}%`)
      ));
    }
    
    if (category && category !== 'all') {
      whereConditions.push(eq(events.category, category));
    }
    
    if (location) {
      whereConditions.push(like(events.location, `%${location}%`));
    }
    
    if (maxPrice !== undefined) {
      whereConditions.push(lt(events.minPrice, maxPrice));
    }
    
    // Handle date filtering
    const now = new Date();
    if (date) {
      switch (date) {
        case 'today':
          const todayEnd = new Date(now);
          todayEnd.setHours(23, 59, 59, 999);
          whereConditions.push(and(
            gte(events.startDate, now),
            lt(events.startDate, todayEnd)
          ));
          break;
        case 'weekend':
          const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
          const daysUntilWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
          const weekendStart = new Date(now);
          weekendStart.setDate(now.getDate() + daysUntilWeekend);
          weekendStart.setHours(0, 0, 0, 0);
          
          const weekendEnd = new Date(weekendStart);
          weekendEnd.setDate(weekendStart.getDate() + 2); // Include Sunday
          weekendEnd.setHours(23, 59, 59, 999);
          
          whereConditions.push(and(
            gte(events.startDate, weekendStart),
            lt(events.startDate, weekendEnd)
          ));
          break;
        case 'week':
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() + 7);
          whereConditions.push(and(
            gte(events.startDate, now),
            lt(events.startDate, weekEnd)
          ));
          break;
        case 'month':
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          whereConditions.push(and(
            gte(events.startDate, now),
            lt(events.startDate, monthEnd)
          ));
          break;
      }
    }
    
    // Combine conditions if any
    const whereClause = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined;
    
    // Count total matching events
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(events)
      .where(whereClause || sql`1=1`);
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(count / limit);
    
    // Get paginated events
    const eventResults = await db
      .select()
      .from(events)
      .where(whereClause || sql`1=1`)
      .orderBy(desc(events.startDate))
      .limit(limit)
      .offset(offset);
    
    return {
      events: eventResults,
      total: count,
      totalPages,
      perPage: limit
    };
  }
  
  async getFeaturedEvents(): Promise<Event[]> {
    const now = new Date();
    return db
      .select()
      .from(events)
      .where(and(
        eq(events.featured, true),
        gte(events.endDate, now)
      ))
      .orderBy(events.startDate)
      .limit(4);
  }
  
  async getAllEvents(): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .orderBy(desc(events.startDate));
  }
  
  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    
    return event;
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...eventData,
        ticketsSold: 0 // Start with 0 tickets sold
      })
      .returning();
    
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    
    return event;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning({ id: events.id });
    
    return result.length > 0;
  }
  
  // Social posts operations
  async getSocialPosts(options: {
    query?: string;
    eventId?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ posts: SocialPost[]; total: number; totalPages: number; perPage: number }> {
    const {
      query,
      eventId,
      sort = 'recent',
      page = 1,
      limit = 12
    } = options;
    
    // Build where conditions
    let whereConditions = [] as any[];
    
    if (query) {
      whereConditions.push(like(socialPosts.content, `%${query}%`));
    }
    
    if (eventId) {
      whereConditions.push(eq(socialPosts.eventId, eventId));
    }
    
    // Combine conditions if any
    const whereClause = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined;
    
    // Count total matching posts
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(socialPosts)
      .where(whereClause || sql`1=1`);
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(count / limit);
    
    // Determine sort order
    let orderByClause;
    switch (sort) {
      case 'popular':
        orderByClause = desc(socialPosts.likes);
        break;
      case 'comments':
        orderByClause = desc(socialPosts.comments);
        break;
      case 'recent':
      default:
        orderByClause = desc(socialPosts.createdAt);
    }
    
    // Get paginated posts with user information
    const postsResults = await db
      .select({
        ...socialPosts,
        user: users
      })
      .from(socialPosts)
      .leftJoin(users, eq(socialPosts.userId, users.id))
      .where(whereClause || sql`1=1`)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
    
    return {
      posts: postsResults,
      total: count,
      totalPages,
      perPage: limit
    };
  }
  
  async getRecentSocialPosts(): Promise<SocialPost[]> {
    const posts = await db
      .select({
        ...socialPosts,
        user: users
      })
      .from(socialPosts)
      .leftJoin(users, eq(socialPosts.userId, users.id))
      .orderBy(desc(socialPosts.createdAt))
      .limit(3);
    
    return posts;
  }
  
  async getSocialPostsByEvent(eventId: number): Promise<SocialPost[]> {
    const posts = await db
      .select({
        ...socialPosts,
        user: users
      })
      .from(socialPosts)
      .leftJoin(users, eq(socialPosts.userId, users.id))
      .where(eq(socialPosts.eventId, eventId))
      .orderBy(desc(socialPosts.createdAt));
    
    return posts;
  }
  
  async createSocialPost(postData: InsertSocialPost): Promise<SocialPost> {
    const [post] = await db
      .insert(socialPosts)
      .values({
        ...postData,
        likes: 0,
        comments: 0,
        createdAt: new Date()
      })
      .returning();
    
    // Fetch the complete post with user information
    const [completePost] = await db
      .select({
        ...socialPosts,
        user: users
      })
      .from(socialPosts)
      .leftJoin(users, eq(socialPosts.userId, users.id))
      .where(eq(socialPosts.id, post.id));
    
    return completePost;
  }
  
  // Tickets operations
  async getUserTickets(userId: string): Promise<Ticket[]> {
    const userTickets = await db
      .select({
        ...tickets,
        event: events
      })
      .from(tickets)
      .leftJoin(events, eq(tickets.eventId, events.id))
      .where(eq(tickets.userId, userId))
      .orderBy(desc(events.startDate));
    
    return userTickets;
  }
  
  // Ticket locations operations
  async getTicketLocations(): Promise<TicketLocation[]> {
    return db
      .select()
      .from(ticketLocations)
      .orderBy(ticketLocations.name);
  }
  
  async createTicketLocation(locationData: InsertTicketLocation): Promise<TicketLocation> {
    const [location] = await db
      .insert(ticketLocations)
      .values(locationData)
      .returning();
    
    return location;
  }
}

export const storage = new DatabaseStorage();
