type Id = string;

export class Repository<T extends { id: Id }> {
  private readonly data = new Map<Id, T>();

  public create(newRecord: T): void {
    this.data.set(newRecord.id, newRecord);
  }

  public find(id: Id): T | undefined {
    return this.data.get(id);
  }

  public list(): T[] {
    return Array.from(this.data.values());
  }
}
