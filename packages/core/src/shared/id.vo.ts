import { ValueObject } from "./value-object";
import { generateUuid, isValidUuid } from "./uuid.util";

export class Id implements ValueObject<Id, string> {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(id?: string): Id {
    const value = id?.trim().toLowerCase() ?? generateUuid();
    this.validate(value);
    return new Id(value);
  }

  private static validate(id: string): void {
    if (!isValidUuid(id)) {
      throw new Error("O id fornecido não é um UUID válido.");
    }
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Id): boolean {
    return other instanceof Id && this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
