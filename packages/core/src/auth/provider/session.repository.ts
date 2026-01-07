import { Session } from '../model/session.entity';

export interface SessionInput {
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface SessionRepository {
  create(input: SessionInput): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByToken(token: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
