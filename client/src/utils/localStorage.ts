import { IGenericObject } from "types";

export function loadState(KEY: string) {
  try {
    const serializedState = localStorage.getItem(KEY);
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    return undefined;
  }
}

export async function saveState(state: IGenericObject, KEY: string) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(KEY, serializedState);
  } catch (e) {
    //
  }
}

export function getToken(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // support either { token } or { auth: { token } }
    const token = parsed?.token || parsed?.auth?.token || null;
    return token;
  } catch (e) {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    // Get existing state
    const raw = localStorage.getItem('user');
    let state: any = {};
    if (raw) {
      try {
        state = JSON.parse(raw);
      } catch (e) {
        // If parsing fails, start fresh
      }
    }
    // Update token in state structure
    if (state.auth) {
      state.auth.token = token;
    } else {
      state.token = token;
    }
    localStorage.setItem('user', JSON.stringify(state));
  } catch (e) {
    // Ignore errors
  }
}

export function removeToken(): void {
  try {
    localStorage.removeItem('user');
  } catch (e) {
    // Ignore errors
  }
}
