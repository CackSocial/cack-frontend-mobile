import {formatCount} from '../src/utils/format';

describe('formatCount', () => {
  it('returns raw values below one thousand', () => {
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands without trailing zeroes', () => {
    expect(formatCount(1_000)).toBe('1K');
    expect(formatCount(1_250)).toBe('1.3K');
  });

  it('formats millions without trailing zeroes', () => {
    expect(formatCount(1_000_000)).toBe('1M');
    expect(formatCount(1_250_000)).toBe('1.3M');
  });
});
