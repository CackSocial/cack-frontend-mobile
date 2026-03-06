export function applyStateUpdate<T>(
  current: T,
  updater: React.SetStateAction<T>,
): T {
  return typeof updater === 'function'
    ? (updater as (currentState: T) => T)(current)
    : updater;
}
