import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";
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
      const message = await storage.createMessage(messageData);
      res.json({ message, success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid message data", success: false });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
