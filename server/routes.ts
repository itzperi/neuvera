import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, insertTrackingEventSchema } from "@shared/schema";
import { groqService } from "./services/groqService";
import { trackingService } from "./services/trackingService";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.validateUser(username, password);
      
      if (user) {
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, success: true });
      } else {
        res.status(401).json({ message: "Invalid credentials", success: false });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid request data", success: false });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists", success: false });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ user: userWithoutPassword, success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data", success: false });
    }
  });

  // Message routes
  app.get("/api/messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getUserMessages(userId);
      res.json({ messages, success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages", success: false });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // If this is a user message, generate AI response
      if (messageData.isUser) {
        // Save user message first
        const userMessage = await storage.createMessage(messageData);
        
        // Track chat interaction event
        await trackingService.trackEvent({
          pixelId: req.headers['x-pixel-id'] as string || trackingService.generatePixelId(),
          eventType: 'chat_interaction',
          currentUrl: req.headers['referer'] || 'unknown',
          userAgent: req.headers['user-agent'],
          userId: messageData.userId,
          sessionId: req.headers['x-session-id'] as string || trackingService.generateSessionId(),
          metadata: { messageLength: messageData.content.length, type: 'user_message' }
        });

        // Generate AI response using Groq
        const aiResponse = await groqService.generateResponse(messageData.content);
        
        // Save AI response
        const aiMessage = await storage.createMessage({
          userId: messageData.userId,
          content: aiResponse.content,
          isUser: false,
          aiModel: aiResponse.model,
          responseTime: aiResponse.responseTime.toString(),
        });

        // Track AI response event
        await trackingService.trackEvent({
          pixelId: req.headers['x-pixel-id'] as string || trackingService.generatePixelId(),
          eventType: 'ai_response',
          currentUrl: req.headers['referer'] || 'unknown',
          userAgent: req.headers['user-agent'],
          userId: messageData.userId,
          sessionId: req.headers['x-session-id'] as string || trackingService.generateSessionId(),
          metadata: { 
            aiModel: aiResponse.model, 
            responseTime: aiResponse.responseTime,
            messageLength: aiResponse.content.length
          }
        });

        res.json({ userMessage, aiMessage, success: true });
      } else {
        // Just save the message if it's not a user message
        const message = await storage.createMessage(messageData);
        res.json({ message, success: true });
      }
    } catch (error) {
      console.error("Message creation error:", error);
      res.status(400).json({ message: "Invalid message data", success: false });
    }
  });

  // Pixel tracking endpoint
  app.post("/api/track", async (req, res) => {
    try {
      const trackingData = insertTrackingEventSchema.parse(req.body);
      
      // Check if user has opted out
      if (trackingData.hashedUserId) {
        const hasOptedOut = await trackingService.hasUserOptedOut(trackingData.hashedUserId);
        if (hasOptedOut) {
          return res.status(200).json({ success: true, message: "User opted out" });
        }
      }

      await trackingService.trackEvent({
        pixelId: trackingData.pixelId,
        eventType: trackingData.eventType,
        currentUrl: trackingData.currentUrl,
        referrerUrl: trackingData.referrerUrl,
        userAgent: req.headers['user-agent'],
        userId: trackingData.hashedUserId,
        sessionId: trackingData.sessionId,
        metadata: trackingData.metadata,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Tracking error:", error);
      res.status(400).json({ success: false, message: "Invalid tracking data" });
    }
  });

  // Pixel tracking image endpoint (for JavaScript-disabled users)
  app.get("/api/pixel.gif", async (req, res) => {
    try {
      const { pid, event, url, ref, sid } = req.query;
      
      if (pid && event && url && sid) {
        await trackingService.trackEvent({
          pixelId: pid as string,
          eventType: event as string,
          currentUrl: url as string,
          referrerUrl: ref as string,
          userAgent: req.headers['user-agent'],
          sessionId: sid as string,
          metadata: null,
        });
      }

      // Return 1x1 transparent GIF
      const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': gif.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(gif);
    } catch (error) {
      console.error("Pixel tracking error:", error);
      res.status(200).end(); // Always return 200 for tracking pixels
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      // Verify admin access
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Authorization required", success: false });
      }

      // Log admin action
      await trackingService.logAdminAction({
        adminUserId: "admin", // This should come from JWT token in production
        action: "view_analytics",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers['user-agent'],
        success: true,
      });

      const analytics = await storage.getAnalyticsSummary();
      res.json({ analytics, success: true });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics", success: false });
    }
  });

  app.get("/api/admin/logs", async (req, res) => {
    try {
      // Verify admin access
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Authorization required", success: false });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getAdminLogs(limit);
      
      res.json({ logs, success: true });
    } catch (error) {
      console.error("Admin logs error:", error);
      res.status(500).json({ message: "Failed to fetch admin logs", success: false });
    }
  });

  // Privacy compliance endpoint
  app.post("/api/privacy/opt-out", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required", success: false });
      }

      await trackingService.optOutUser(userId);
      res.json({ message: "Successfully opted out of tracking", success: true });
    } catch (error) {
      console.error("Opt-out error:", error);
      res.status(500).json({ message: "Failed to opt out", success: false });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
