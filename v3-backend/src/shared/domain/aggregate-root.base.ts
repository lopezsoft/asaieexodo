import { Entity } from './entity.base';

export interface DomainEvent {
  readonly eventName: string;
  readonly occurredOn: Date;
  readonly schoolId: bigint;
}

export abstract class AggregateRoot<TId, TProps> extends Entity<TId, TProps> {
  private readonly domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}
