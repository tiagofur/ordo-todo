export interface KeyResultTaskProps {
    keyResultId: string;
    taskId: string;
    weight: number;
}

/**
 * KeyResultTask domain representation (Value Object or simple link)
 */
export class KeyResultTask {
    constructor(public readonly props: KeyResultTaskProps) { }

    get keyResultId(): string {
        return this.props.keyResultId;
    }

    get taskId(): string {
        return this.props.taskId;
    }

    get weight(): number {
        return this.props.weight;
    }
}
