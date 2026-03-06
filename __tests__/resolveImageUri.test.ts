import {resolveImageUri} from '../src/utils/resolveImageUri';

describe('resolveImageUri', () => {
  it('rewrites absolute upload urls to use the configured uploads host', () => {
    expect(
      resolveImageUri('http://localhost:8080/uploads/example.png'),
    ).toBe('http://10.0.2.2:8080/uploads/example.png');
  });

  it('returns null for missing values', () => {
    expect(resolveImageUri(undefined)).toBeNull();
  });

  it('prefixes relative image paths with the uploads host', () => {
    expect(resolveImageUri('avatars/example.png')).toBe(
      'http://10.0.2.2:8080/uploads/avatars/example.png',
    );
  });
});
