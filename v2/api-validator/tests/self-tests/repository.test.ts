import { Repository } from '../../src/server/controllers/repository';

describe('Repository tests', () => {
  type TestElement = {
    id: string;
    value: {
      v1: string;
      v2: number;
    };
  };
  const repository = new Repository<TestElement>();

  it('should remove duplicates correctly', () => {
    const firstRecord = { id: 'id1', value: { v1: 'value1', v2: 1 } };
    const secondRecord = { id: 'id2', value: { v1: 'value1', v2: 1 } };
    repository.create(firstRecord);
    repository.create(secondRecord);
    repository.removeDuplicatesBy((e) => e.value);
    expect(repository.list()).toStrictEqual([firstRecord]);
  });
});
