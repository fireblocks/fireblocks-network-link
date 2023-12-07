import _ from 'lodash';

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

  public removeDuplicatesBy(rule: { (item: T): unknown }): void {
    const dataArray = Array.from(this.data.entries());
    const newData = _.uniqWith(dataArray, ([, value1], [, value2]) =>
      _.isEqual(rule(value1), rule(value2))
    );
    this.data.clear();
    newData.forEach(([key, value]) => this.data.set(key, value));
  }
}
