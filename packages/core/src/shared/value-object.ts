export interface ValueObject<T, V = unknown> {
  value: V;
  equals(other: T): boolean;
  toString(): string;
  toJSON(): string;
}
