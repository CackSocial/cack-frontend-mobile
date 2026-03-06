import type {Message} from '../types';

let optimisticMessageCounter = 0;

export function createOptimisticMessageId(): string {
  optimisticMessageCounter += 1;
  return `tmp-${Date.now()}-${optimisticMessageCounter}`;
}

export function findOptimisticMessageIndex(
  messages: Message[],
  confirmedMessage: Message,
): number {
  const candidates = messages
    .map((message, index) => ({message, index}))
    .filter(
      ({message}) =>
        message.id.startsWith('tmp-')
        && message.content === confirmedMessage.content
        && message.receiver_id === confirmedMessage.receiver_id,
    );

  if (!candidates.length) {
    return -1;
  }

  const confirmedTimestamp = Date.parse(confirmedMessage.created_at);
  if (Number.isNaN(confirmedTimestamp)) {
    return candidates[0].index;
  }

  let bestCandidate = candidates[0];
  let bestDistance = Math.abs(
    Date.parse(bestCandidate.message.created_at) - confirmedTimestamp,
  );

  candidates.slice(1).forEach(candidate => {
    const candidateTimestamp = Date.parse(candidate.message.created_at);
    const candidateDistance = Number.isNaN(candidateTimestamp)
      ? Number.POSITIVE_INFINITY
      : Math.abs(candidateTimestamp - confirmedTimestamp);

    if (candidateDistance < bestDistance) {
      bestCandidate = candidate;
      bestDistance = candidateDistance;
    }
  });

  return bestCandidate.index;
}
