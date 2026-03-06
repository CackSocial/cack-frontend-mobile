import {applyStateUpdate} from '../src/utils/state';

describe('applyStateUpdate', () => {
  it('applies functional updates', () => {
    expect(applyStateUpdate([1, 2], current => [...current, 3])).toEqual([1, 2, 3]);
  });

  it('returns direct replacement values', () => {
    expect(applyStateUpdate([1, 2], [3, 4])).toEqual([3, 4]);
  });
});
