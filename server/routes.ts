import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import { createId } from "@paralleldrive/cuid2";
import fs from "fs/promises";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
const storage_config = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueId = createId();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Events Routes
  app.get('/api/events', async (req, res) => {
    try {
      const { q, category, date, location, maxPrice, page = '1', limit = '12' } = req.query;
      
      const events = await storage.getEvents({
        query: q as string,
        category: category as string,
        date: date as string,
        location: location as string,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/featured', async (req, res) => {
    try {
      const featuredEvents = await storage.getFeaturedEvents();
      res.json(featuredEvents);
    } catch (error) {
      console.error("Error fetching featured events:", error);
      res.status(500).json({ message: "Failed to fetch featured events" });
    }
  });

  app.get('/api/events/admin', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching admin events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEventById(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const event = await storage.createEvent({
        ...req.body,
        organizerId: user.id
      });
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const eventId = parseInt(req.params.id);
      const event = await storage.updateEvent(eventId, req.body);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(eventId);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Social Posts Routes
  app.get('/api/social-posts', async (req, res) => {
    try {
      const { q, eventId, sort = 'recent', page = '1', limit = '12' } = req.query;
      
      const posts = await storage.getSocialPosts({
        query: q as string,
        eventId: eventId ? parseInt(eventId as string) : undefined,
        sort: sort as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching social posts:", error);
      res.status(500).json({ message: "Failed to fetch social posts" });
    }
  });

  app.get('/api/social-posts/recent', async (req, res) => {
    try {
      const recentPosts = await storage.getRecentSocialPosts();
      res.json(recentPosts);
    } catch (error) {
      console.error("Error fetching recent posts:", error);
      res.status(500).json({ message: "Failed to fetch recent posts" });
    }
  });

  app.get('/api/social-posts/event/:eventId', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const posts = await storage.getSocialPostsByEvent(eventId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching event posts:", error);
      res.status(500).json({ message: "Failed to fetch event posts" });
    }
  });

  app.post('/api/social-posts', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, eventId } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      let imageUrl = null;
      if (req.file) {
        // Create a path that can be accessed via the API
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const post = await storage.createSocialPost({
        userId,
        content,
        eventId: eventId ? parseInt(eventId) : undefined,
        imageUrl
      });
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating social post:", error);
      res.status(500).json({ message: "Failed to create social post" });
    }
  });

  // Tickets Routes
  app.get('/api/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tickets = await storage.getUserTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // Ticket Locations Routes
  app.get('/api/ticket-locations', async (req, res) => {
    try {
      const locations = await storage.getTicketLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching ticket locations:", error);
      res.status(500).json({ message: "Failed to fetch ticket locations" });
    }
  });

  app.post('/api/ticket-locations', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const { name, address } = req.body;
      
      if (!name || !address) {
        return res.status(400).json({ message: "Name and address are required" });
      }
      
      const location = await storage.createTicketLocation({ name, address });
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating ticket location:", error);
      res.status(500).json({ message: "Failed to create ticket location" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadDir, path.basename(req.path));
    res.sendFile(filePath, (err) => {
      if (err) {
        next();
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
