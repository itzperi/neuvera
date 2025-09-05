import { users, messages, trackingEvents, adminLogs, type User, type InsertUser, type Message, type InsertMessage, type TrackingEvent, type InsertTrackingEvent, type AdminLog, type InsertAdminLog } from "@shared/schema";
import crypto from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  getUserMessages(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent>;
  getTrackingEvents(timeRange: { start: Date; end: Date }): Promise<TrackingEvent[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  updateUserPrivacySettings(userId: number, settings: { optedOut?: boolean; privacyConsent?: boolean }): Promise<void>;
  getAnalyticsSummary(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private trackingEvents: Map<number, TrackingEvent>;
  private adminLogs: Map<number, AdminLog>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentTrackingId: number;
  private currentAdminLogId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.trackingEvents = new Map();
    this.adminLogs = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentTrackingId = 1;
    this.currentAdminLogId = 1;
    
    // Create default admin user with privacy fields
    const hashedId = crypto.createHash('sha256').update('neuvera').digest('hex');
    const adminUser: User = {
      id: this.currentUserId++,
      username: "neuvera",
      password: "1234",
      isAdmin: true,
      hashedId,
      privacyConsent: true,
      optedOut: false,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const hashedId = crypto.createHash('sha256').update(insertUser.username + id.toString()).digest('hex');
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: insertUser.isAdmin || false,
      hashedId,
      privacyConsent: insertUser.privacyConsent || false,
      optedOut: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async getUserMessages(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.userId === userId,
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id,
      aiModel: insertMessage.aiModel || "groq",
      responseTime: insertMessage.responseTime || null,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async createTrackingEvent(insertEvent: InsertTrackingEvent): Promise<TrackingEvent> {
    const id = this.currentTrackingId++;
    const event: TrackingEvent = {
      ...insertEvent,
      id,
      timestamp: new Date(),
    };
    this.trackingEvents.set(id, event);
    return event;
  }

  async getTrackingEvents(timeRange: { start: Date; end: Date }): Promise<TrackingEvent[]> {
    return Array.from(this.trackingEvents.values()).filter(
      event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );
  }

  async createAdminLog(insertLog: InsertAdminLog): Promise<AdminLog> {
    const id = this.currentAdminLogId++;
    const log: AdminLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
    };
    this.adminLogs.set(id, log);
    return log;
  }

  async getAdminLogs(limit: number = 100): Promise<AdminLog[]> {
    const logs = Array.from(this.adminLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return logs.slice(0, limit);
  }

  async updateUserPrivacySettings(userId: number, settings: { optedOut?: boolean; privacyConsent?: boolean }): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      if (settings.optedOut !== undefined) user.optedOut = settings.optedOut;
      if (settings.privacyConsent !== undefined) user.privacyConsent = settings.privacyConsent;
      this.users.set(userId, user);
    }
  }

  async getAnalyticsSummary(): Promise<any> {
    const totalUsers = this.users.size;
    const totalMessages = this.messages.size;
    const totalEvents = this.trackingEvents.size;
    const totalAdminActions = this.adminLogs.size;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = Array.from(this.trackingEvents.values())
      .filter(event => event.timestamp >= last24Hours);

    return {
      totalUsers,
      totalMessages,
      totalEvents,
      totalAdminActions,
      recentEvents: recentEvents.length,
      lastUpdated: new Date(),
    };
  }
}

export const storage = new MemStorage();
