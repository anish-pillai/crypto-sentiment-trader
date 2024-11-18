import { randomUUID } from 'crypto';
import NodeCache from 'node-cache';

class SessionService {
  private sessions = new NodeCache({ stdTTL: 86400 }); // 24 hour TTL

  createSession(): string {
    const sessionId = randomUUID();
    this.sessions.set(sessionId, {
      createdAt: new Date(),
      lastAccessed: new Date(),
    });
    return sessionId;
  }

  validateSession(sessionId: string): boolean {
    if (!sessionId) return false;

    const session = this.sessions.get(sessionId);
    if (!session) {
      // If session doesn't exist, create a new one
      this.sessions.set(sessionId, {
        createdAt: new Date(),
        lastAccessed: new Date(),
      });
      return true;
    }

    // Update last accessed time
    this.sessions.set(sessionId, {
      ...session,
      lastAccessed: new Date(),
    });
    return true;
  }

  removeSession(sessionId: string): void {
    this.sessions.del(sessionId);
  }
}

export const sessionService = new SessionService();
