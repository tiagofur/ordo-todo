import { Entity, EntityProps } from "../../shared/entity";

export interface NoteProps extends EntityProps {
  content: string;
  workspaceId: string;
  authorId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Note extends Entity<NoteProps> {
  constructor(props: NoteProps) {
    super({
      ...props,
      x: props.x ?? 100,
      y: props.y ?? 100,
      width: props.width ?? 300,
      height: props.height ?? 300,
      color: props.color ?? "#feff9c",
    });
  }

  static create(props: Omit<NoteProps, "id" | "createdAt" | "updatedAt">): Note {
    return new Note({
      ...props,
      x: props.x ?? 100,
      y: props.y ?? 100,
      width: props.width ?? 300,
      height: props.height ?? 300,
      color: props.color ?? "#feff9c",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  updateContent(content: string): Note {
    return this.clone({
      content,
      updatedAt: new Date(),
    });
  }

  updatePosition(x: number, y: number): Note {
    return this.clone({
      x,
      y,
      updatedAt: new Date(),
    });
  }

  updateSize(width: number, height: number): Note {
    return this.clone({
      width,
      height,
      updatedAt: new Date(),
    });
  }

  updateColor(color: string): Note {
    return this.clone({
      color,
      updatedAt: new Date(),
    });
  }

  update(props: Partial<Omit<NoteProps, "id" | "workspaceId" | "authorId">>): Note {
    return this.clone({
      ...props,
      updatedAt: new Date(),
    });
  }
}
