// Session management with 30-min expiry and file persistence

import fs from 'fs/promises';
import path from 'path';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SessionData {
  customerId: string;
  conversationHistory: Message[];
  lastActivity: number;
  messageCount: number;
}

export class SessionStore {
  private sessions: Map<string, SessionData>;
  private expiryMinutes: number;
  private persistPath: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(expiryMinutes: number = 30, persistPath: string = './whatsapp_sessions.json') {
    this.sessions = new Map();
    this.expiryMinutes = expiryMinutes;
    this.persistPath = persistPath;

    // Load persisted sessions on startup
    this.loadSessions().catch(err => {
      console.warn('Failed to load persisted sessions:', err.message);
    });

    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
  }

  private async loadSessions(): Promise<void> {
    try {
      const data = await fs.readFile(this.persistPath, 'utf-8');
      const sessionsArray: SessionData[] = JSON.parse(data);

      for (const session of sessionsArray) {
        // Only load unexpired sessions
        if (Date.now() - session.lastActivity < this.expiryMinutes * 60 * 1000) {
          this.sessions.set(session.customerId, session);
        }
      }

      console.log(`Loaded ${this.sessions.size} active session(s) from ${this.persistPath}`);
    } catch (err) {
      // File doesn't exist or invalid JSON - start fresh
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('Error loading sessions, starting fresh:', err);
      }
    }
  }

  private async saveSessions(): Promise<void> {
    try {
      const sessionsArray = Array.from(this.sessions.values());
      await fs.writeFile(this.persistPath, JSON.stringify(sessionsArray, null, 2));
    } catch (err) {
      console.error('Failed to persist sessions:', err);
    }
  }

  private debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => this.saveSessions(), 2000);
  }

  getSession(customerId: string): SessionData {
    let session = this.sessions.get(customerId);

    if (session) {
      const age = Date.now() - session.lastActivity;
      if (age > this.expiryMinutes * 60 * 1000) {
        // Session expired - reset history
        console.log(`Session expired for ${customerId} (idle ${Math.round(age / 60000)} min)`);
        session.conversationHistory = [];
        session.messageCount = 0;
        session.lastActivity = Date.now();
      }
    } else {
      // New session
      session = {
        customerId,
        conversationHistory: [],
        lastActivity: Date.now(),
        messageCount: 0
      };
      this.sessions.set(customerId, session);
      console.log(`New session created for ${customerId}`);
    }

    return session;
  }

  updateSession(customerId: string, history: Message[]): void {
    const session = this.sessions.get(customerId);
    if (session) {
      session.conversationHistory = history;
      session.lastActivity = Date.now();
      session.messageCount++;
      this.debouncedSave();
    }
  }

  private cleanupExpired(): void {
    const before = this.sessions.size;
    const now = Date.now();

    for (const [customerId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.expiryMinutes * 60 * 1000) {
        this.sessions.delete(customerId);
      }
    }

    const removed = before - this.sessions.size;
    if (removed > 0) {
      console.log(`Cleaned up ${removed} expired session(s)`);
      this.debouncedSave();
    }
  }

  getStats(): { total: number; active: number } {
    const now = Date.now();
    let active = 0;

    for (const session of this.sessions.values()) {
      if (now - session.lastActivity < this.expiryMinutes * 60 * 1000) {
        active++;
      }
    }

    return { total: this.sessions.size, active };
  }
}
