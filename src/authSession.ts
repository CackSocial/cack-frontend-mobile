let logoutHandler: (() => void) | null = null;

export function setLogoutHandler(handler: (() => void) | null): void {
  logoutHandler = handler;
}

export function triggerSessionLogout(): void {
  logoutHandler?.();
}
