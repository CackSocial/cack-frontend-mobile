import type {Message} from '../src/types';
import {
  createOptimisticMessageId,
  findOptimisticMessageIndex,
} from '../src/utils/messages';

describe('createOptimisticMessageId', () => {
  it('returns unique ids for rapid consecutive sends', () => {
    const first = createOptimisticMessageId();
    const second = createOptimisticMessageId();

    expect(first).not.toBe(second);
    expect(first.startsWith('tmp-')).toBe(true);
    expect(second.startsWith('tmp-')).toBe(true);
  });
});

describe('findOptimisticMessageIndex', () => {
  function createMessage(overrides: Partial<Message> = {}): Message {
    return {
      id: overrides.id ?? createOptimisticMessageId(),
      sender_id: overrides.sender_id ?? 'sender-1',
      receiver_id: overrides.receiver_id ?? 'receiver-1',
      content: overrides.content ?? 'hello',
      image_url: overrides.image_url ?? '',
      read_at: overrides.read_at ?? null,
      created_at: overrides.created_at ?? '2026-01-01T00:00:00.000Z',
    };
  }

  it('picks the optimistic message closest in time to the confirmed echo', () => {
    const optimisticMessages = [
      createMessage({id: 'tmp-1', created_at: '2026-01-01T00:00:00.000Z'}),
      createMessage({id: 'tmp-2', created_at: '2026-01-01T00:00:05.000Z'}),
    ];

    const confirmedMessage = createMessage({
      id: 'server-1',
      created_at: '2026-01-01T00:00:04.800Z',
    });

    expect(findOptimisticMessageIndex(optimisticMessages, confirmedMessage)).toBe(1);
  });

  it('returns -1 when there is no optimistic candidate', () => {
    const confirmedMessage = createMessage({id: 'server-1'});

    expect(findOptimisticMessageIndex([], confirmedMessage)).toBe(-1);
  });
});
